// src/app/api/create-custom-token/route.ts
import { NextResponse } from 'next/server';
import { admin, isFirebaseEnabled } from '@/lib/firebase-server';

export async function POST(request: Request) {
  if (!isFirebaseEnabled) {
    return NextResponse.json(
      { error: 'Firebase is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required.' },
        { status: 400 }
      );
    }

    // Use the wallet address as the UID for the Firebase user.
    const uid = address;

    // Create a custom token for the user.
    // This doesn't create a user record until they sign in with the token.
    const customToken = await admin.auth().createCustomToken(uid);

    return NextResponse.json({ token: customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}