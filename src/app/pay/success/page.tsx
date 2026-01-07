import { Icon } from '@/components/ui/icon'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="checkCircle" size="3xl" className="text-emerald-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-gray-500 mb-6">
          Thank you for your payment. The service provider has been notified.
        </p>

        <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 mb-6 flex items-start gap-3">
          <Icon name="email" size="lg" className="text-primary flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Confirmation sent</p>
            <p className="mt-1">A receipt has been sent to your email address.</p>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          You can safely close this window now.
        </p>
      </div>
    </div>
  )
}
