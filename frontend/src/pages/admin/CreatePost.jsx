import React, { useRef, useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { postsAPI } from '../../services/api'

const DESCRIPTION_TOOLS = [
  { label: 'B', title: 'Bold', type: 'wrap', prefix: '**', suffix: '**', placeholder: 'bold text', className: 'font-extrabold' },
  { label: 'I', title: 'Italic', type: 'wrap', prefix: '_', suffix: '_', placeholder: 'italic text', className: 'italic' },
  { label: 'U', title: 'Underline', type: 'wrap', prefix: '__', suffix: '__', placeholder: 'underlined text', className: 'underline' },
  { label: '•', title: 'Bullet List', type: 'line-prefix', prefix: '- ' },
]

function CreatePost() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const descriptionRef = useRef(null)
  const [form, setForm] = useState({
    title: '',
    thumbnail: '',
    beneficial_for: '',
    short_description: '',
    detailed_description: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    postsAPI.getById(id)
      .then((res) => {
        const { title, thumbnail, beneficial_for, short_description, detailed_description } = res.data
        setForm({
          title: title || '',
          thumbnail: thumbnail || '',
          beneficial_for: beneficial_for || '',
          short_description: short_description || '',
          detailed_description: detailed_description || '',
        })
      })
      .catch(() => setError('Failed to load scheme data'))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  const isFormComplete = Object.values(form).every((value) => value.trim())

  const handleChange = (e) => {
    const { name, value } = e.target
    setError('')
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleBeneficialKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const textarea = e.target
    const value = form.beneficial_for
    const pos = textarea.selectionStart

    const lineStart = value.lastIndexOf('\n', pos - 1) + 1
    const currentLine = value.slice(lineStart, pos)

    // Empty bullet line → strip bullet, just newline
    if (currentLine === '- ') {
      const next = value.slice(0, lineStart) + '\n' + value.slice(pos)
      setForm((f) => ({ ...f, beneficial_for: next }))
      requestAnimationFrame(() => textarea.setSelectionRange(lineStart + 1, lineStart + 1))
      return
    }

    // If current line has no bullet yet, prefix it first
    let updatedValue = value
    let updatedPos = pos
    if (currentLine.length > 0 && !currentLine.startsWith('- ')) {
      updatedValue = value.slice(0, lineStart) + '- ' + value.slice(lineStart)
      updatedPos = pos + 2
    }

    const insertion = '\n- '
    const next = updatedValue.slice(0, updatedPos) + insertion + updatedValue.slice(updatedPos)
    const nextPos = updatedPos + insertion.length
    setForm((f) => ({ ...f, beneficial_for: next }))
    requestAnimationFrame(() => textarea.setSelectionRange(nextPos, nextPos))
  }

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file for the thumbnail')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setError('')
      setForm((currentForm) => ({
        ...currentForm,
        thumbnail: typeof reader.result === 'string' ? reader.result : '',
      }))
    }
    reader.onerror = () => setError('Failed to read the selected thumbnail image')
    reader.readAsDataURL(file)
  }

  const applyDescriptionFormat = (tool) => {
    const textarea = descriptionRef.current
    if (!textarea) return
    const value = form.detailed_description
    const selectionStart = textarea.selectionStart ?? 0
    const selectionEnd = textarea.selectionEnd ?? 0
    const selectedText = value.slice(selectionStart, selectionEnd)
    let nextValue = value
    let nextSelectionStart = selectionStart
    let nextSelectionEnd = selectionEnd

    if (tool.type === 'wrap') {
      const insertion = `${tool.prefix}${selectedText || tool.placeholder}${tool.suffix}`
      nextValue = `${value.slice(0, selectionStart)}${insertion}${value.slice(selectionEnd)}`
      if (selectedText) {
        nextSelectionStart = selectionStart + tool.prefix.length
        nextSelectionEnd = nextSelectionStart + selectedText.length
      } else {
        nextSelectionStart = selectionStart + tool.prefix.length
        nextSelectionEnd = nextSelectionStart + tool.placeholder.length
      }
    }

    if (tool.type === 'line-prefix') {
      const start = value.lastIndexOf('\n', Math.max(selectionStart - 1, 0)) + 1
      const endBreakIndex = value.indexOf('\n', selectionEnd)
      const end = endBreakIndex === -1 ? value.length : endBreakIndex
      const selectedBlock = value.slice(start, end)
      const lines = selectedBlock.split('\n')
      const prefixedLines = lines.map((line) => (line.startsWith(tool.prefix) ? line : `${tool.prefix}${line}`))
      const insertion = prefixedLines.join('\n')
      nextValue = `${value.slice(0, start)}${insertion}${value.slice(end)}`
      nextSelectionStart = start
      nextSelectionEnd = start + insertion.length
    }

    setForm((currentForm) => ({ ...currentForm, detailed_description: nextValue }))
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormComplete) {
      setError('Please fill in all fields before publishing the scheme')
      return
    }
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        await postsAPI.update(id, form)
      } else {
        await postsAPI.create(form)
      }
      setSuccess(true)
      setTimeout(() => navigate('/admin'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${isEdit ? 'update' : 'create'} scheme post`)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <main className="page-container animate-fade-in max-w-3xl flex justify-center py-20">
        <div className="spinner w-8 h-8" />
      </main>
    )
  }

  return (
    <main className="page-container animate-fade-in max-w-3xl">
      <Link to="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">{isEdit ? 'Edit Scheme' : 'Create New Scheme'}</h1>
        <p className="text-gray-400 mt-1 text-sm">
          {isEdit ? 'Update the details below to modify this scheme' : 'Fill in the details below to publish a government scheme post'}
        </p>
      </div>

      <div className="glass-card p-8">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{isEdit ? 'Scheme Updated!' : 'Scheme Published!'}</h3>
            <p className="text-gray-400 text-sm">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form id="create-post-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="input-label">Scheme Title *</label>
              <input
                id="post-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. PM Kisan Samman Nidhi Yojana"
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Thumbnail Image *</label>
              <input
                id="post-thumbnail"
                name="thumbnail"
                value={form.thumbnail}
                onChange={handleChange}
                required
                placeholder="Paste an image URL here"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-2">Paste an image link or browse for an image from this device.</p>
              <label htmlFor="post-thumbnail-file" className="btn-secondary mt-3 inline-flex cursor-pointer">
                Browse Device
              </label>
              <input
                id="post-thumbnail-file"
                type="file"
                accept="image/*"
                onChange={handleThumbnailFileChange}
                className="hidden"
              />
              {form.thumbnail && (
                <div className="mt-2 h-32 rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={form.thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="input-label">Beneficial For *</label>
              <textarea
                id="post-beneficial"
                name="beneficial_for"
                value={form.beneficial_for}
                onChange={handleChange}
                onKeyDown={handleBeneficialKeyDown}
                required
                rows={4}
                placeholder={`Examples:\n- Farmers\n- Women entrepreneurs\n- Senior citizens`}
                className="input-field resize-y"
              />
              <p className="text-xs text-gray-500 mt-2">Press Enter to automatically add bullet points for each line.</p>
            </div>

            <div>
              <label className="input-label">Short Description *</label>
              <textarea
                id="post-short-desc"
                name="short_description"
                value={form.short_description}
                onChange={handleChange}
                rows={2}
                required
                placeholder="Brief summary shown on the scheme card (1-2 sentences)"
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="input-label">Detailed Description *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {DESCRIPTION_TOOLS.map((tool) => (
                  <button
                    key={tool.title}
                    type="button"
                    title={tool.title}
                    onClick={() => applyDescriptionFormat(tool)}
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-200 transition-colors hover:bg-white/10 ${tool.className || ''}`}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
              <textarea
                ref={descriptionRef}
                id="post-detailed-desc"
                name="detailed_description"
                value={form.detailed_description}
                onChange={handleChange}
                rows={8}
                required
                placeholder="Full details of the scheme - eligibility, benefits, how to apply, etc."
                className="input-field resize-y"
              />
              <p className="text-xs text-gray-500 mt-2">Select text, then use the tools for bold, italic, underline, or bullet points.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link to="/admin" className="btn-secondary flex-1 justify-center">Cancel</Link>
              <button
                id="publish-post-btn"
                type="submit"
                disabled={loading || !isFormComplete}
                className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="spinner w-4 h-4" /> {isEdit ? 'Saving...' : 'Publishing...'}</>
                  : isEdit ? 'Save Changes' : 'Publish Scheme'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

export default CreatePost
