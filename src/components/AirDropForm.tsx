"use client"

import InputField from "./ui/InputField"   
import { calculateTotal, parseNumberList, parseHexList } from "@/utils"
import { useState, useMemo, useEffect } from "react"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { useChainId, useConfig, useAccount, useWriteContract, useReadContracts, useWaitForTransactionReceipt } from "wagmi"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { isAddress } from "ethers"


export default function AirDropForm() {
  const TOKEN_KEY = "airdrop-token-address"
  const RECIPIENTS_KEY = "airdrop-recipients"
  const AMOUNTS_KEY = "airdrop-amounts"
  const [tokenAddress, setTokenAddress] = useState("")
  const [recipients, setRecipients] = useState("")
  const [amounts, setAmounts] = useState("")

  // local cache for form data
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTokenAddress(localStorage.getItem(TOKEN_KEY) || "")
      setRecipients(localStorage.getItem(RECIPIENTS_KEY) || "")
      setAmounts(localStorage.getItem(AMOUNTS_KEY) || "")
    }
  }, [])

  const chainId = useChainId()
  const config = useConfig()
  const account = useAccount()
  
  const [txStatus, setTxStatus] = useState<"idle" | "confirming" | "confirmed" | "error" | "cancelled">("idle")
  const { data: hash, isPending, writeContractAsync } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash,
  })

  // sets transaction state to display 
  useEffect(() => {
    if (!hash) {
      setTxStatus("idle")
    } else if (isConfirmed) {
      setTxStatus("confirmed")
    } else if (isError) {
      setTxStatus("error")
    }
  }, [hash, isConfirmed, isError])

  // Reset status to remove banner after 4 seconds
  useEffect(() => {
    if (txStatus === "confirmed" || txStatus === "error") {
      const timeout = setTimeout(() => {
        setTxStatus("idle")
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [txStatus])

  function getBannerColor(status: string) {
    return status === "confirmed"
      ? "bg-green-600"
      : "bg-red-600"
  }

  // Check the token address and get token data to display
  const { data: tokenMeta } = useReadContracts({
    contracts: [
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "name",
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account.address],
      },
    ],
    query: {
      enabled: isAddress(tokenAddress) && !!account.address,
    }
  })

  // display variables 
  const tokenName = tokenMeta?.[0]?.result as string | undefined
  const tokenDecimals = tokenMeta?.[1]?.result as number | undefined
  const tokenBalance = tokenMeta?.[2]?.result as bigint | undefined
  
  // Total amount to be sent, check user balance
  const total: bigint = useMemo(() => calculateTotal(amounts), [amounts])
  const hasEnoughBalance = tokenBalance !== undefined && total !== undefined && tokenBalance >= total

  const humanReadableTotal = useMemo(() => {
    if (tokenDecimals !== undefined && total !== undefined) {
      return (Number(total) / 10 ** tokenDecimals).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: tokenDecimals,
      })
    }
    return undefined
  }, [total, tokenDecimals])

  // read from the chain to see if we have enough approved tokens
  async function getApprovedAmount(tSenderAddress: string | null): Promise<bigint> {
      if (!tSenderAddress) {
          alert("No address found, please use a supported chain")
          return BigInt(0)
      }
      const response = await readContract(config, {
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "allowance",
          args: [account.address, tSenderAddress as `0x${string}`],
      })

      return response as bigint    
  }
  
  async function handleSubmit() {
    if (!isAddress(tokenAddress)) {
      alert("Please enter a valid token address")
      return
    }
    
    if(total <= 0n) {
      alert("Please enter a valid amount")
      return
    }

    const amountsList = parseNumberList(amounts)
    const recipientsList = parseHexList(recipients)
    if(amountsList.length !== recipientsList.length) {
      alert("The number of recipients and amounts must match")
      return
    }

    if (!hasEnoughBalance) {
      alert("You do not have enough tokens to send")
      return
    }

    // 1a if already approved, skip
    // 1b. Approve the right amount of tokens for our tsender to send the requested tokens
    // 2. Call the airdrop function from the contract
    // 3. wait for the tranaction to be mined

    const tSenderAddress = chainsToTSender[chainId]["tsender"]

    try {
      const approvedAmount = await getApprovedAmount(tSenderAddress)
    
      if (approvedAmount < total) {
          const approvalHash = await writeContractAsync({
              abi: erc20Abi,
              address: tokenAddress as `0x${string}`,
              functionName: "approve",
              args: [tSenderAddress as `0x${string}`, total - approvedAmount],
          })   
          await waitForTransactionReceipt(config, {
            hash: approvalHash
          })
      }
      const hash = await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [
          tokenAddress,
          recipientsList,
          amountsList,
          total,
        ],
      }) 
      setTxStatus("confirming")
    } catch (err: any) {
      setTxStatus("error")
    }
  }

  return (
    <>
      {["confirmed", "error"].includes(txStatus) && (
        <div className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-md text-white shadow-lg ${getBannerColor(txStatus)}`}>
          {txStatus === "confirmed" && "Transaction confirmed!"}
          {txStatus === "error" && "Transaction failed."}
        </div>
      )}

      <div className="flex justify-center mt-[20px]">
        <div className="w-[800px] border border-gray-300 rounded-lg p-6 space-y-4 bg-white shadow">

          <InputField
            label="Token Address"
            placeholder="0x"
            value={tokenAddress}
            onChange={(e) => {
              const value = e.target.value
              setTokenAddress(value)
              localStorage.setItem(TOKEN_KEY, value)
            }}
          />
          <InputField
            label="Recipients"
            placeholder="0x..., 0x..., 0x..."
            value={recipients}
            onChange={(e) => {
              const value = e.target.value
              setRecipients(value)
              localStorage.setItem(RECIPIENTS_KEY, value)
            }}
            large={true}
          />
          <InputField
            label="Amounts"
            placeholder="100, 200, 300"
            value={amounts}
            onChange={(e) => {
              const value = e.target.value
              setAmounts(value)
              localStorage.setItem(AMOUNTS_KEY, value)
            }}
            large={true}
          />

          <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 space-y-2">
            <div className="font-semibold text-base mb-2">Transaction Details</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Token Name</span>
                <span className="font-medium">{tokenName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount (wei)</span>
                {total > 0n ? (
                  <span className="font-medium">{total.toString()}</span>
                ) : null}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token Amount</span>
                <span className="font-medium">{humanReadableTotal}</span>
              </div>
            </div>
          </div>

          <button
            className="w-full bg-blue-600 text-white py-2 rounded-md transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              "Send Tokens"
            )}
          </button>

        </div>
      </div>
    </>
   );
}
