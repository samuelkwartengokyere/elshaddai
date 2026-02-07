'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  Shield,
  Heart,
  Target,
  Users,
  Building
} from 'lucide-react'

export default function FinancialReportPage() {
  const [selectedYear, setSelectedYear] = useState('2024')
  const [showDetails, setShowDetails] = useState(false)

  // Sample financial data
  const financialData = {
    year: '2024',
    totalReceipts: 1250000,
    totalExpenditure: 1180000,
    netSurplus: 70000,
    receiptBreakdown: [
      { category: 'Tithes & Offerings', amount: 850000, percentage: 68, color: 'bg-accent' },
      { category: 'Building Fund', amount: 180000, percentage: 14.4, color: 'bg-primary' },
      { category: 'Missions & Outreach', amount: 120000, percentage: 9.6, color: 'bg-secondary' },
      { category: 'Donations', amount: 100000, percentage: 8, color: 'bg-green-500' },
    ],
    expenditureBreakdown: [
      { category: 'Personnel & Salaries', amount: 450000, percentage: 38.1, icon: Users },
      { category: 'Building & Maintenance', amount: 280000, percentage: 23.7, icon: Building },
      { category: 'Missions & Outreach', amount: 200000, percentage: 16.9, icon: Target },
      { category: 'Programs & Ministries', amount: 150000, percentage: 12.7, icon: Heart },
      { category: 'Administration', amount: 100000, percentage: 8.5, icon: PieChart },
    ],
    quarterlyData: [
      { quarter: 'Q1', receipts: 280000, expenditure: 265000 },
      { quarter: 'Q2', receipts: 310000, expenditure: 295000 },
      { quarter: 'Q3', receipts: 320000, expenditure: 310000 },
      { quarter: 'Q4', receipts: 340000, expenditure: 310000 },
    ]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <DollarSign className="h-16 w-16 text-accent mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Financial Reports</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Transparency is important to us. View how your generosity is helping us fulfill our mission.
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Receipts */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <ArrowDown className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Year {financialData.year}</span>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Total Receipts</h3>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(financialData.totalReceipts)}
                </p>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from previous year
                </p>
              </div>

              {/* Total Expenditure */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <ArrowUp className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-sm text-gray-500">Year {financialData.year}</span>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Total Expenditure</h3>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(financialData.totalExpenditure)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {((financialData.totalExpenditure / financialData.totalReceipts) * 100).toFixed(1)}% of receipts
                </p>
              </div>

              {/* Net Surplus */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <PieChart className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Year {financialData.year}</span>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Net Surplus</h3>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(financialData.netSurplus)}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Reserved for future projects
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Year Selector */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
            <div className="flex justify-center space-x-2">
              {['2024', '2023', '2022', '2021'].map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-6 py-2 rounded-lg font-medium transition duration-300 ${
                    selectedYear === year
                      ? 'bg-accent text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Receipts Breakdown */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Where Our Money Comes From</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Chart */}
              <div>
                <div className="bg-gray-50 rounded-xl p-8">
                  <div className="relative w-64 h-64 mx-auto">
                    {/* Simple pie chart visualization */}
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {financialData.receiptBreakdown.reduce((acc, item, index) => {
                        const startAngle = acc.offset
                        const angle = (item.percentage / 100) * 360
                        const endAngle = startAngle + angle
                        
                        const startRad = (startAngle - 90) * (Math.PI / 180)
                        const endRad = (endAngle - 90) * (Math.PI / 180)
                        
                        const x1 = 50 + 40 * Math.cos(startRad)
                        const y1 = 50 + 40 * Math.sin(startRad)
                        const x2 = 50 + 40 * Math.cos(endRad)
                        const y2 = 50 + 40 * Math.sin(endRad)
                        
                        const largeArc = angle > 180 ? 1 : 0
                        
                        acc.elements.push(
                          <path
                            key={index}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={item.color.replace('bg-', '').replace('-500', '-400').replace('-100', '')}
                            className={item.color}
                          />
                        )
                        acc.offset = endAngle
                        return acc
                      }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">
                          {formatCurrency(financialData.totalReceipts)}
                        </p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div>
                <div className="space-y-4">
                  {financialData.receiptBreakdown.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full ${item.color} mr-3`} />
                          <span className="font-medium text-gray-800">{item.category}</span>
                        </div>
                        <span className="font-bold text-gray-800">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 text-right">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expenditure Breakdown */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How We Use Our Resources</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Breakdown */}
              <div className="space-y-4">
                {financialData.expenditureBreakdown.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="bg-accent/10 p-2 rounded-lg mr-3">
                            <Icon className="h-5 w-5 text-accent" />
                          </div>
                          <span className="font-medium text-gray-800">{item.category}</span>
                        </div>
                        <span className="font-bold text-gray-800">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 text-right">{item.percentage}%</p>
                    </div>
                  )
                })}
              </div>

              {/* Chart */}
              <div>
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-bold mb-6">Quarterly Overview</h3>
                  <div className="space-y-6">
                    {financialData.quarterlyData.map((quarter, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-gray-700">{quarter.quarter}</span>
                          <div className="text-right">
                            <span className="text-green-600 font-medium">
                              ↑ {formatCurrency(quarter.receipts)}
                            </span>
                            <span className="text-gray-400 mx-2">|</span>
                            <span className="text-red-600 font-medium">
                              ↓ {formatCurrency(quarter.expenditure)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 flex overflow-hidden">
                          <div
                            className="bg-green-500 h-4"
                            style={{ width: `${(quarter.receipts / 400000) * 100}%` }}
                          />
                          <div
                            className="bg-red-500 h-4"
                            style={{ width: `${(quarter.expenditure / 400000) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>Income</span>
                          <span>Expenses</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Statement */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-16 w-16 text-accent mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Our Commitment to Transparency</h2>
            <p className="text-gray-600 text-lg mb-8">
              We take your generosity seriously. Every donation is handled with integrity and accountability.
              Our financial records are audited annually by an independent accounting firm.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-bold text-lg mb-2">Annual Audit</h3>
                <p className="text-gray-600 text-sm">
                  Our finances are audited annually by a qualified independent auditor to ensure accuracy and compliance.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-bold text-lg mb-2">Financial Committee</h3>
                <p className="text-gray-600 text-sm">
                  A dedicated finance committee oversees all financial matters and provides accountability.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-bold text-lg mb-2">Open Records</h3>
                <p className="text-gray-600 text-sm">
                  Full financial statements are available upon request for members and donors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">View Full Financial Statements</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Download our complete audited financial statements for {selectedYear}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition duration-300">
              <Download className="h-5 w-5 mr-2" />
              Download PDF
            </button>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition duration-300"
            >
              <Eye className="h-5 w-5 mr-2" />
              View Online
            </button>
          </div>
        </div>
      </section>

      {/* Giving Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="h-16 w-16 text-accent mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Thank You for Your Generosity</h2>
            <p className="text-gray-600 text-lg mb-8">
              Your gifts make it possible for us to fulfill our mission of spreading God's love and serving our community. 
              Every dollar given is a dollar invested in eternity.
            </p>
            <Link
              href="/give"
              className="inline-flex items-center bg-accent text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition duration-300"
            >
              Give Online Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

