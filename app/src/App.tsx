import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { StoreProvider } from './store/store'
import Home from './pages/Home'
import Listing from './pages/Listing'
import Checkout from './pages/Checkout'
import Voucher from './pages/Voucher'
import Trips from './pages/Trips'
import Owner from './pages/Owner'
import Association from './pages/Association'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="homestay/:id" element={<Listing />} />
            <Route path="checkout/:holdId" element={<Checkout />} />
            <Route path="booking/:id" element={<Voucher />} />
            <Route path="trips" element={<Trips />} />
            <Route path="owner" element={<Owner />} />
            <Route path="association" element={<Association />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
