// src/app/api/create-custom-token/route.ts
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-server';

export async function POST(request: Request) {
  try {
    const { auth } = getFirebaseAdmin();
    
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
    const customToken = await auth.createCustomToken(uid);

    return NextResponse.json({ token: customToken });

  } catch (error: any) {
    // Log the detailed error on the server for debugging
    console.error('Error in create-custom-token endpoint:', error.message);
    
    // Provide a clear error message if the SDK failed to initialize
    // This is the error thrown from getFirebaseAdmin()
    if (error.message.includes('Firebase Admin SDK')) {
        return NextResponse.json(
          { error: 'Firebase is not configured on the server.' },
          { status: 500 }
        );
    }
    
    // Generic internal server error for other issues
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
