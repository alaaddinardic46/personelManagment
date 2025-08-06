'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { api } from '@/api'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const id = sessionStorage.getItem('id');
    const statu = sessionStorage.getItem('status');
    if(id){
        let status = "/user";
        if(statu == "1"){
            status = "/";
        }
        router.push(status);
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basit boş alan kontrolü
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.')
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      const response = await axios.post(api+'personel/Login', {
        email,
        password,
      })

      const data = response.data

      if (data.success) {
        setSuccessMessage(data.message)
        sessionStorage.setItem("id", data.id);
        sessionStorage.setItem("status", data.status);
        sessionStorage.setItem("fullName", data.nameSurname);
        sessionStorage.setItem("email", data.email);
        console.log(data);
        // 1 saniye sonra ana sayfaya yönlendir
        let status = "/user";
        if(data.status == 1){
            status = "/";
        }
        setTimeout(() => {
          router.push(status)
        }, 1000)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Sunucu hatası veya bağlantı sağlanamadı.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription>Lütfen giriş bilgilerinizi girin</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label className='mb-1' htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
              />
            </div>
            <div>
              <Label className='mb-1' htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="mt-4 w-full">
              Giriş Yap
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}