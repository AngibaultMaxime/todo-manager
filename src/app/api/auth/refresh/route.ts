import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAccessToken, verifyRefreshToken } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    // Récupérer le refresh token depuis le cookie
    const refreshToken = req.cookies.get('refreshToken')?.value
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token manquant' },
        { status: 401 }
      )
    }
    
    // Vérifier le refresh token
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch (error) {
      return NextResponse.json(
        { error: 'Refresh token invalide ou expiré' },
        { status: 401 }
      )
    }
    
    // Vérifier que le token existe toujours en base
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })
    
    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token invalide' },
        { status: 401 }
      )
    }
    
    // Générer un nouveau access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    
    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    })
    
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du rafraîchissement du token' },
      { status: 500 }
    )
  }
}