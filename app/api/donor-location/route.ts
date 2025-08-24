import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (in production, use a database)
let donorLocations: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const donorData = await request.json();
    
    // Add timestamp if not present
    if (!donorData.timestamp) {
      donorData.timestamp = Date.now();
    }
    
    // Find existing donor or add new one
    const existingIndex = donorLocations.findIndex(d => d.donorCode === donorData.donorCode);
    
    if (existingIndex >= 0) {
      donorLocations[existingIndex] = donorData;
    } else {
      donorLocations.push(donorData);
    }
    
    console.log('Donor location updated:', donorData.donorCode, donorData.lat, donorData.lng);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Location updated successfully',
      donorCode: donorData.donorCode 
    });
  } catch (error) {
    console.error('Error updating donor location:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update location' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Clean up old locations (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    donorLocations = donorLocations.filter(donor => donor.timestamp > fiveMinutesAgo);
    
    return NextResponse.json({ 
      success: true, 
      donors: donorLocations 
    });
  } catch (error) {
    console.error('Error fetching donor locations:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch locations' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const donorCode = url.searchParams.get('donorCode');
    
    if (donorCode) {
      // Remove specific donor
      donorLocations = donorLocations.filter(d => d.donorCode !== donorCode);
      return NextResponse.json({ 
        success: true, 
        message: 'Donor removed successfully' 
      });
    } else {
      // Clear all donors (for page reload/reset)
      donorLocations = [];
      return NextResponse.json({ 
        success: true, 
        message: 'All donors cleared successfully' 
      });
    }
  } catch (error) {
    console.error('Error removing donor:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to remove donor' 
    }, { status: 500 });
  }
}
