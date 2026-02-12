'use client'
import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Users, 
  Trash2, 
  Edit,
  Mail,
  Phone,
  Loader2,
  X,
  Crown
} from 'lucide-react'

interface TeamMember {
  _id: string
  name: string
  role: string
  bio: string
  image?: string
  email?: string
  phone?: string
  department?: string
  isLeadership: boolean
  isPublished: boolean
  order: number
}

export default function TeamsPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    email: '',
    phone: '',
    department: '',
    isLeadership: false
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTeamMembers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      if (departmentFilter) params.append('department', departmentFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/teams?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTeamMembers(data.teamMembers)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }))
      }
    } catch (err) {
      console.error('Error fetching team members:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [pagination.page, departmentFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchTeamMembers()
  }

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({
      name: '',
      role: '',
      bio: '',
      email: '',
      phone: '',
      department: '',
      isLeadership: false
    })
    setEditingMember(null)
    setError('')
    setSuccess('')
    setShowCreateModal(true)
  }

  const openEditModal = (member: TeamMember) => {
    setModalMode('edit')
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      email: member.email || '',
      phone: member.phone || '',
      department: member.department || '',
      isLeadership: member.isLeadership
    })
    setError('')
    setSuccess('')
    setShowCreateModal(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Team member added successfully!')
        setShowCreateModal(false)
        setFormData({
          name: '',
          role: '',
          bio: '',
          email: '',
          phone: '',
          department: '',
          isLeadership: false
        })
        fetchTeamMembers()
      } else {
        setError(data.error || 'Failed to add team member')
      }
    } catch (err) {
      setError('An error occurred while adding team member')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/teams?id=${editingMember._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Team member updated successfully!')
        setShowCreateModal(false)
        setEditingMember(null)
        fetchTeamMembers()
      } else {
        setError(data.error || 'Failed to update team member')
      }
    } catch (err) {
      setError('An error occurred while updating team member')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return
    
    setDeletingId(id)
    try {
      const response = await fetch(`/api/teams?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Team member deleted successfully!')
        fetchTeamMembers()
      } else {
        alert(data.error || 'Failed to delete team member')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('An error occurred while deleting')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent w-64"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">All Departments</option>
              <option value="Leadership">Leadership</option>
              <option value="Worship">Worship</option>
              <option value="Children">Children</option>
              <option value="Youth">Youth</option>
              <option value="Outreach">Outreach</option>
              <option value="Administration">Administration</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Search
            </button>
          </form>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Team Members</p>
          <p className="text-2xl font-bold">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">This Page</p>
          <p className="text-2xl font-bold text-blue-600">{teamMembers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Leadership</p>
          <p className="text-2xl font-bold text-yellow-500">
            {teamMembers.filter(t => t.isLeadership).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Published</p>
          <p className="text-2xl font-bold text-green-500">
            {teamMembers.filter(t => t.isPublished).length}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-gray-600">Loading team members...</span>
        </div>
      )}

      {/* Team Members Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div key={member._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition duration-300">
                {/* Image */}
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="h-16 w-16 text-gray-400" />
                  )}
                  {member.isLeadership && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white p-2 rounded-full">
                      <Crown className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{member.name}</h3>
                    {member.department && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {member.department}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-accent font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{member.bio}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    {member.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="flex items-center text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                    <button
                      onClick={() => openEditModal(member)}
                      className="flex items-center text-accent hover:text-red-600"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {teamMembers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-lg shadow">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No team members found</h3>
              <p className="text-gray-600 mb-4">
                {search || departmentFilter
                  ? 'Try adjusting your search or filters'
                  : 'Add your first team member to get started'}
              </p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Team Member
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                  className={`px-4 py-2 rounded-lg ${
                    pagination.page === page
                      ? 'bg-accent text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
          {/* Modal content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Add Team Member' : 'Edit Team Member'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={modalMode === 'create' ? handleCreate : handleUpdate} className="p-4">
              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  {success}
                </div>
              )}

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              {/* Role */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role/Position *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="e.g., Senior Pastor, Worship Leader"
                />
              </div>

              {/* Bio */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio *
                </label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={4}
                  placeholder="Brief biography..."
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Worship">Worship</option>
                  <option value="Children">Children</option>
                  <option value="Youth">Youth</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Administration">Administration</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Leadership */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isLeadership}
                    onChange={(e) => setFormData(prev => ({ ...prev, isLeadership: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">This is a leadership team member</span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {uploading 
                    ? (modalMode === 'create' ? 'Saving...' : 'Saving...')
                    : (modalMode === 'create' ? 'Add Team Member' : 'Save Changes')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

