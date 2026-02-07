import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Testimony from '@/models/Testimony'

export async function DELETE(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Testimony ID is required' },
        { status: 400 }
      )
    }

    const testimony = await Testimony.findByIdAndDelete(id)

    if (!testimony) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Testimony deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting testimony:', error)
    return NextResponse.json(
      { error: 'Failed to delete testimony' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Testimony ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    const testimony = await Testimony.findByIdAndUpdate(
      id,
      {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    if (!testimony) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      testimony,
      message: 'Testimony updated successfully'
    })

  } catch (error) {
    console.error('Error updating testimony:', error)
    return NextResponse.json(
      { error: 'Failed to update testimony' },
      { status: 500 }
    )
  }
}

