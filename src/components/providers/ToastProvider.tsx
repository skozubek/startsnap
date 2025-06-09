/**
 * src/components/providers/ToastProvider.tsx
 * @description Toast notification provider using Sonner with neobrutalist styling
 */

import { Toaster } from 'sonner'
import './toast-styles.css'

/**
 * @description Toast provider component with custom neobrutalist styling that matches StartSnap design system
 * @returns {JSX.Element} Configured Toaster component with neobrutalist aesthetics
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      duration={4000}
      toastOptions={{
        style: {
          border: '2px solid #1f2937',
          borderRadius: '8px',
          boxShadow: '3px 3px 0px #1f2937',
          fontFamily: "'Roboto', Helvetica",
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 32px 12px 16px',
          minHeight: '60px',
          position: 'relative'
        },
        className: 'startsnap-toast',
        // Success toast styling
        classNames: {
          success: 'bg-startsnap-mountain-meadow text-white border-gray-800',
          error: 'bg-startsnap-french-rose text-white border-gray-800',
          warning: 'bg-startsnap-corn text-startsnap-ebony-clay border-gray-800',
          info: 'bg-startsnap-french-pass text-startsnap-persian-blue border-gray-800',
          default: 'bg-startsnap-white text-startsnap-ebony-clay border-gray-800',
          closeButton: 'startsnap-close-button'
        }
      }}
    />
  )
}