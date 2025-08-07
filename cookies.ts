import cookie from 'js-cookie'

// Cookie'ye veri kaydetme
export const setCookie = (key: string, value: any, expiresIn: number = 1) => {
  const options = {
    expires: expiresIn, // Süreyi gün cinsinden belirleyebilirsiniz
    path: '/', // Cookie'nin tüm site genelinde geçerli olması için
  }
  cookie.set(key, JSON.stringify(value), options)
}

// Cookie'den veri okuma
export const getCookie = (key: string) => {
  const cookieValue = cookie.get(key)
  return cookieValue ? JSON.parse(cookieValue) : null
}

// Cookie'yi silme
export const removeCookie = (key: string) => {
  cookie.remove(key, { path: '/' })
}