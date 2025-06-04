"use client"
import AirDropForm from '@/components/AirDropForm'
import {useAccount} from 'wagmi'

export default function HomeContent() {
    const {isConnected} = useAccount()
    return (
        <div>
            {isConnected ? (
                    <div>
                        <AirDropForm />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-screen text-2xl font-semibold text-gray-700">
                        Please connect a wallet...
                    </div>
                )
            }
        </div>
    )
}