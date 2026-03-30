'use client'

import { useState, useEffect } from 'react'
import { Shield, Calendar, TrendingUp, BarChart3, Users, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface FinancialData {
  totalReceipts: number
  totalExpenditure: number
  netSurplus: number
  receiptBreakdown: Array<{category: string, amount: number, percentage: number}>
  expenditureBreakdown?: Array<{category: string, amount: number, percentage: number}> // Made optional
  monthlyData: Array<{year: number, month: string, receipts: number, count: number}>
  count: number
  uniqueDonors: number
  year: number
  currency: string
}

export default function AdminFinancialReport() {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  const fetchReport = async (selectedYear: number) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/financial-report?year=${selectedYear}`)
      if (!response.ok) {
        throw new Error('Failed to fetch report')
      }
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'No data available')
      }
    } catch (err) {
      setError('Error loading financial report')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport(year)
  }, [year])

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value)
    setYear(newYear)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Loading financial report...</p>
      </div>
    )
  }

  const exportToPDF = async () => {
    if (!data) return
    setExporting(true)
    try {
      const element = document.getElementById('financial-report-content')
      if (!element) throw new Error('Report content not found')
      
        const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      pdf.save(`el-shaddai-financial-report-${data.year}.pdf`)
    } catch (error) {
      console.error('PDF Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div id="financial-report-content" className="space-y-6 p-6 print:p-8 print:max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Report</h1>
            <p className="text-gray-600">{data?.year} Fiscal Year</p>
          </div>
        </div>
        <select 
          value={year} 
          onChange={handleYearChange}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {exporting ? (
          <div className="px-4 py-2 bg-blue-500 text-white rounded-md animate-pulse flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exporting...
          </div>
        ) : (
          <button
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!data}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Receipts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.currency} {data.totalReceipts.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Expenditure</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.currency} {data.totalExpenditure.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Surplus</p>
                  <p className="text-2xl font-bold text-green-600">
                    {data.currency} {data.netSurplus.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Breakdown Table */}
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Receipt Breakdown
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.receiptBreakdown.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {data.currency} {item.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expenditure Breakdown Table */}
          {data.expenditureBreakdown && data.expenditureBreakdown.length > 0 && (
            <div className="bg-white rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Expenditure Breakdown
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.expenditureBreakdown.map((item, idx) => (
                      <tr key={`exp-${idx}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {data.currency} {item.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Key Stats</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Total Transactions:</span> {data.count}</p>
                <p><span className="font-medium">Unique Donors:</span> {data.uniqueDonors}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
{(data.monthlyData?.slice(-6) ?? []).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1">
                  <span>{item.month}</span>
                  <span className="font-medium">{data.currency} {item.receipts.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Data Audit Trail
            </h3>
            <p className="text-gray-700">
              All data sourced from completed donation records. Data is aggregated from Supabase donations table.
              View raw donations in Admin Donations.
            </p>
          </div>
        </>
      )}
    </div>
  )
}