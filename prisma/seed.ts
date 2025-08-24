import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'

const prisma = new PrismaClient()

interface UserData {
  user_id: string
  name: string
  gender: 'Male' | 'Female' | 'Other'
  mobile: string
  date_of_birth: Date
  blood_group: string
  city: string
  pincode: number
  role: string
  insert_time: Date
}

interface BridgeFighterData {
  id: number
  bridge_id: string
  bridge_name: string
  user_id: string
  blood_group: string
  frequency_in_days: string
  no_units: number
}

interface MappingData {
  id: number
  bridge_id: string
  user_id: string
  role: string
}

interface DonationData {
  id: number
  user_id: string
  donation_date: Date
  next_eligible_date: Date
  donation_type: string
  bridge_id: string
  donation_status: string
}

// Blood group mapping function
function mapBloodGroup(bloodGroup: string): string {
  const mapping: { [key: string]: string } = {
    'A+': 'A_POSITIVE',
    'A-': 'A_NEGATIVE',
    'B+': 'B_POSITIVE',
    'B-': 'B_NEGATIVE',
    'AB+': 'AB_POSITIVE',
    'AB-': 'AB_NEGATIVE',
    'O+': 'O_POSITIVE',
    'O-': 'O_NEGATIVE'
  }
  return mapping[bloodGroup] || 'O_POSITIVE'
}

// User role mapping function
function mapUserRole(role: string): string {
  const mapping: { [key: string]: string } = {
    'Fighter': 'FIGHTER',
    'Bridge Donor': 'BRIDGE_DONOR',
    'Emergency Donor': 'EMERGENCY_DONOR'
  }
  return mapping[role] || 'EMERGENCY_DONOR'
}

// Donation type mapping function
function mapDonationType(type: string): string {
  const mapping: { [key: string]: string } = {
    'Blood Bridge Donation': 'BLOOD_BRIDGE_DONATION',
    'Voluntary Donation': 'VOLUNTARY_DONATION'
  }
  return mapping[type] || 'VOLUNTARY_DONATION'
}

// Donation status mapping function
function mapDonationStatus(status: string): string {
  const mapping: { [key: string]: string } = {
    'Complete': 'COMPLETE',
    'Pending': 'PENDING',
    'Rejected': 'REJECTED'
  }
  return mapping[status] || 'PENDING'
}

async function importExcelData() {
  try {
    console.log('🚀 Starting data import...')
    
    // Read Excel file
    const workbook = XLSX.readFile(path.join(__dirname, '../datasets/BW_Sample_Data_Updated_v3.xlsx'))
    
    // Import Users
    console.log('📥 Importing users...')
    const userSheet = workbook.Sheets['user_data']
    const userData: UserData[] = XLSX.utils.sheet_to_json(userSheet)
    
    for (const user of userData) {
      await prisma.user.create({
        data: {
          userId: user.user_id,
          name: user.name,
          gender: user.gender,
          mobile: user.mobile,
          dateOfBirth: new Date(user.date_of_birth),
          bloodGroup: mapBloodGroup(user.blood_group) as any,
          city: user.city,
          pincode: user.pincode,
          role: mapUserRole(user.role) as any,
          insertTime: new Date(user.insert_time)
        }
      })
    }
    console.log(`✅ Imported ${userData.length} users`)

    // Import Bridge Fighter Info
    console.log('📥 Importing bridge fighter info...')
    const bridgeSheet = workbook.Sheets['bridge_fighter_info']
    const bridgeData: BridgeFighterData[] = XLSX.utils.sheet_to_json(bridgeSheet)
    
    for (const bridge of bridgeData) {
      await prisma.bridgeFighterInfo.create({
        data: {
          bridgeId: bridge.bridge_id,
          bridgeName: bridge.bridge_name,
          userId: bridge.user_id,
          bloodGroup: mapBloodGroup(bridge.blood_group) as any,
          frequencyInDays: bridge.frequency_in_days,
          noUnits: bridge.no_units
        }
      })
    }
    console.log(`✅ Imported ${bridgeData.length} bridge fighter records`)

    // Import Bridge User Mappings
    console.log('📥 Importing bridge user mappings...')
    const mappingSheet = workbook.Sheets['mapping_bridge_user_role']
    const mappingData: MappingData[] = XLSX.utils.sheet_to_json(mappingSheet)
    
    for (const mapping of mappingData) {
      await prisma.bridgeUserMapping.create({
        data: {
          bridgeId: mapping.bridge_id,
          userId: mapping.user_id,
          role: mapUserRole(mapping.role) as any
        }
      })
    }
    console.log(`✅ Imported ${mappingData.length} bridge user mappings`)

    // Import Donation Tracker
    console.log('📥 Importing donation tracker...')
    const donationSheet = workbook.Sheets['tracker_donation']
    const donationData: DonationData[] = XLSX.utils.sheet_to_json(donationSheet)
    
    for (const donation of donationData) {
      await prisma.donationTracker.create({
        data: {
          userId: donation.user_id,
          donationDate: new Date(donation.donation_date),
          nextEligibleDate: new Date(donation.next_eligible_date),
          donationType: mapDonationType(donation.donation_type) as any,
          bridgeId: donation.bridge_id,
          donationStatus: mapDonationStatus(donation.donation_status) as any
        }
      })
    }
    console.log(`✅ Imported ${donationData.length} donation records`)

    // Create some sample emergency requests and notifications
    console.log('📥 Creating sample emergency requests...')
    const fighters = await prisma.user.findMany({
      where: { role: 'FIGHTER' },
      take: 5
    })

    for (let i = 0; i < 3; i++) {
      const fighter = fighters[i]
      if (fighter) {
        await prisma.emergencyRequest.create({
          data: {
            requesterId: fighter.userId,
            patientName: `Patient ${i + 1}`,
            bloodGroup: fighter.bloodGroup,
            unitsRequired: Math.floor(Math.random() * 3) + 1,
            urgencyLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any,
            location: fighter.city,
            contactNumber: fighter.mobile,
            hospitalName: `${fighter.city} General Hospital`,
            description: `Urgent blood requirement for thalassemia patient`,
            requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
          }
        })
      }
    }
    console.log('✅ Created sample emergency requests')

    // Create sample hospitals
    console.log('📥 Creating sample hospitals...')
    const hospitals = [
      { name: 'Mumbai Thalassemia Center', city: 'Mumbai', pincode: 400001 },
      { name: 'Delhi Blood Bank', city: 'Delhi', pincode: 110001 },
      { name: 'Hyderabad Medical Center', city: 'Hyderabad', pincode: 500001 },
      { name: 'Pune General Hospital', city: 'Pune', pincode: 411001 },
      { name: 'Kolkata Blood Center', city: 'Kolkata', pincode: 700001 }
    ]

    for (const hospital of hospitals) {
      await prisma.hospital.create({
        data: {
          name: hospital.name,
          address: `123 Medical Street, ${hospital.city}`,
          city: hospital.city,
          pincode: hospital.pincode,
          contactNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          bloodBankInfo: 'Full service blood bank with 24/7 emergency support',
          isVerified: true
        }
      })
    }
    console.log('✅ Created sample hospitals')

    console.log('🎉 Data import completed successfully!')
    
  } catch (error) {
    console.error('❌ Error importing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importExcelData()
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })
