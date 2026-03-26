import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function App() {
  const [session, setSession] = useState(null)
  const [tab, setTab] = useState('forum')
  const [posts, setPosts] = useState([])
  const [reviews, setReviews] = useState([])
  const [jobs, setJobs] = useState([])
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [jobType, setJobType] = useState('')
  const [authMsg, setAuthMsg] = useState('')
  const [showPostForm, setShowPostForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showJobForm, setShowJobForm] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    fetchPosts()
    fetchReviews()
    fetchJobs()
  }, [])

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    if (data) setPosts(data)
  }

  async function fetchReviews() {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  async function fetchJobs() {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    if (data) setJobs(data)
  }

  async function handleLogin(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthMsg('ログインに失敗しました: ' + error.message)
    else { setShowAuth(false); setAuthMsg('') }
  }

  async function handleSignup(e) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setAuthMsg('登録に失敗しました: ' + error.message); return }
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, username, job_type: jobType })
    }
    setAuthMsg('確認メールを送信しました。メールを確認してください。')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f4f6f9', minHeight: '100vh' }}>
      {/* HEADER */}
      <header style={{ background: '#1a2744', color: '#fff', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Construct<span style={{ color: '#4a90d9' }}>Hub</span></div>
        <nav style={{ display: 'flex', gap: 24 }}>
          {['forum','jobs','review'].map(t => (
            <span key={t} onClick={() => setTab(t)} style={{ cursor: 'pointer', color: tab === t ? '#fff' : '#a0b4cc', fontWeight: tab === t ? 700 : 400, fontSize: 14 }}>
              {t === 'forum' ? 'フォーラム' : t === 'jobs' ? '求人・案件' : '企業口コミ'}
            </span>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 12 }}>
          {session ? (
            <button onClick={handleLogout} style={{ padding: '7px 18px', borderRadius: 6, border: '1.5px solid #4a90d9', background: 'transparent', color: '#4a90d9', cursor: 'pointer', fontWeight: 600 }}>ログアウト</button>
          ) : (
            <>
              <button onClick={() => { setShowAuth(true); setAuthMode('login') }} style={{ padding: '7px 18px', borderRadius: 6, border: '1.5px solid #4a90d9', background: 'transparent', color: '#4a90d9', cursor: 'pointer', fontWeight: 600 }}>ログイン</button>
              <button onClick={() => { setShowAuth(true); setAuthMode('signup') }} style={{ padding: '7px 18px', borderRadius: 6, border: 'none', background: '#4a90d9', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>新規登録</button>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #1a2744 0%, #2c4a8c 100%)', color: '#fff', textAlign: 'center', padding: '48px 32px' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>土木・建築のプロが集まる情報交流の場</h1>
        <p style={{ color: '#a0b4cc', marginBottom: 0 }}>技術情報・現場の知恵・求人情報をシェアしよう</p>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 1100, margin: '32px 0', padding: '0 32px' }}>

        {/* FORUM */}
        {tab === 'forum' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ color: '#1a2744', margin: 0 }}>フォーラム</h2>
              {session && <button onClick={() => setShowPostForm(!showPostForm)} style={{ padding: '8px 20px', background: '#4a90d9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>＋ 投稿する</button>}
            </div>
            {showPostForm && <PostForm session={session} onSubmit={async (d) => { await supabase.from('posts').insert({ ...d, user_id: session.user.id }); fetchPosts(); setShowPostForm(false) }} />}
            {posts.length === 0 ? <p style={{ color: '#718096' }}>まだ投稿がありません。最初の投稿をしてみましょう！</p> : posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}

        {/* JOBS */}
        {tab === 'jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ color: '#1a2744', margin: 0 }}>求人・案件</h2>
              {session && <button onClick={() => setShowJobForm(!showJobForm)} style={{ padding: '8px 20px', background: '#4a90d9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>＋ 掲載する</button>}
            </div>
            {showJobForm && <JobForm session={session} onSubmit={async (d) => { await supabase.from('jobs').insert({ ...d, user_id: session.user.id }); fetchJobs(); setShowJobForm(false) }} />}
            {jobs.length === 0 ? <p style={{ color: '#718096' }}>まだ求人・案件がありません。</p> : jobs.map(j => <JobCard key={j.id} job={j} />)}
          </div>
        )}

        {/* REVIEW */}
        {tab === 'review' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ color: '#1a2744', margin: 0 }}>企業口コミ（匿名）</h2>
              {session && <button onClick={() => setShowReviewForm(!showReviewForm)} style={{ padding: '8px 20px', background: '#4a90d9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>✏️ 口コミを書く</button>}
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fbd38d', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#744210' }}>
              <strong>📋 投稿ガイドライン：</strong>実体験に基づく情報のみ。個人への誹謗中傷・虚偽情報は禁止です。
            </div>
            {showReviewForm && <ReviewForm session={session} onSubmit={async (d) => { await supabase.from('reviews').insert({ ...d, user_id: session.user.id }); fetchReviews(); setShowReviewForm(false) }} />}
            {reviews.length === 0 ? <p style={{ color: '#718096' }}>まだ口コミがありません。</p> : reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
      </div>

      {/* AUTH MODAL */}
      {showAuth && (
        <div onClick={() => setShowAuth(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 36, width: 400, maxWidth: '95vw', position: 'relative' }}>
            <button onClick={() => setShowAuth(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#a0aec0' }}>✕</button>
            <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#1a2744', marginBottom: 20 }}>Construct<span style={{ color: '#4a90d9' }}>Hub</span></div>
            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: 24 }}>
              {['login', 'signup'].map(m => (
                <div key={m} onClick={() => setAuthMode(m)} style={{ flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: authMode === m ? '#1a2744' : '#a0aec0', borderBottom: authMode === m ? '2px solid #4a90d9' : '2px solid transparent', marginBottom: -2 }}>
                  {m === 'login' ? 'ログイン' : '新規登録'}
                </div>
              ))}
            </div>
            {authMode === 'signup' && (
              <>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="表示名" style={inputStyle} />
                <select value={jobType} onChange={e => setJobType(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }}>
                  <option value="">職種を選択</option>
                  <option>施工管理技士</option>
                  <option>設計士・建築士</option>
                  <option>現場作業員・職人</option>
                  <option>ゼネコン社員</option>
                  <option>発注者・行政</option>
                  <option>その他</option>
                </select>
              </>
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="メールアドレス" type="email" style={inputStyle} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワード" type="password" style={inputStyle} />
            {authMsg && <p style={{ color: '#c53030', fontSize: 13, marginBottom: 8 }}>{authMsg}</p>}
            <button onClick={authMode === 'login' ? handleLogin : handleSignup} style={{ width: '100%', padding: 12, background: '#4a90d9', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              {authMode === 'login' ? 'ログイン' : '新規登録する'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box', display: 'block' }
const cardStyle = { background: '#fff', borderRadius: 10, padding: 20, marginBottom: 12, border: '1px solid #e2e8f0' }

function PostForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('技術')
  return (
    <div style={cardStyle}>
      <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle }}>
        <option>技術</option><option>Q&A</option><option>安全・法規</option><option>その他</option>
      </select>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトル" style={inputStyle} />
      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="本文" style={{ ...inputStyle, height: 100, resize: 'vertical' }} />
      <button onClick={() => onSubmit({ title, body, category })} style={{ padding: '8px 20px', background: '#4a90d9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>投稿する</button>
    </div>
  )
}

function PostCard({ post }) {
  return (
    <div style={cardStyle}>
      <span style={{ background: '#ebf4ff', color: '#2b6cb0', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4 }}>{post.category}</span>
      <div style={{ fontSize: 15, fontWeight: 600, margin: '8px 0 4px', color: '#2d3748' }}>{post.title}</div>
      <div style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>{post.body}</div>
      <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 8 }}>{new Date(post.created_at).toLocaleDateString('ja-JP')}</div>
    </div>
  )
}

function JobForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('正社員')
  const [salary, setSalary] = useState('')
  return (
    <div style={cardStyle}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="求人タイトル" style={inputStyle} />
      <input value={company} onChange={e => setCompany(e.target.value)} placeholder="会社名" style={inputStyle} />
      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="勤務地" style={inputStyle} />
      <select value={jobType} onChange={e => setJobType(e.target.value)} style={inputStyle}>
        <option>正社員</option><option>外注</option><option>アルバイト</option><option>契約社員</option>
      </select>
      <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="給与・報酬（例：年収600万円）" style={inputStyle} />
      <button onClick={() => onSubmit({ title, company, location, job_type: jobType, salary })} style={{ padding: '8px 20px', background: '#4a90d9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>掲載する</button>
    </div>
  )
}

function JobCard({ job }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#2d3748' }}>{job.title}</div>
        <span style={{ background: '#ebf4ff', color: '#2b6cb0', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4 }}>{job.job_type}</span>
      </div>
      <div style={{ fontSize: 13, color: '#718096', marginBottom: 6 }}>🏢 {job.company} ／ {job.location}</div>
      {job.salary && <div style={{ fontSize: 13, fontWeight: 700, color: '#276749' }}>{job.salary}</div>}
    </div>
  )
}

function ReviewForm({ onSubmit }) {
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [rating, setRating] = useState(3)
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  return (
    <div style={cardStyle}>
      <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="会社名" style={inputStyle} />
      <input value={role} onChange={e => setRole(e.target.value)} placeholder="役職・職種（例：施工管理／在籍3年）" style={inputStyle} />
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5568' }}>評価：{rating} / 5</label>
        <input type="range" min={1} max={5} step={0.5} value={rating} onChange={e => setRating(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
      </div>
      <textarea value={pros} onChange={e => setPros(e.target.value)} placeholder="👍 良い点" style={{ ...inputStyle, height: 80 }} />
      <textarea value={cons} onChange={e => setCons(e.target.value)} placeholder="👎 気になる点" style={{ ...inputStyle, height: 80 }} />
      <button onClick={() => onSubmit({ company_name: companyName, role, rating: parseFloat(rating), pros, cons })} style={{ padding: '8px 20px', background: '#4a90d9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>投稿する（匿名）</button>
    </div>
  )
}

function ReviewCard({ review }) {
  const stars = '★'.repeat(Math.round(review.rating)) + '☆'.repeat(5 - Math.round(review.rating))
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2744' }}>🏢 {review.company_name}</div>
          <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{review.role}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#f6ad55', fontSize: 18 }}>{stars}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a2744' }}>{review.rating}</div>
        </div>
      </div>
      {review.pros && <><div style={{ fontSize: 13, fontWeight: 700, color: '#276749', marginBottom: 4 }}>👍 良い点</div><p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.6, marginBottom: 10 }}>{review.pros}</p></>}
      {review.cons && <><div style={{ fontSize: 13, fontWeight: 700, color: '#c53030', marginBottom: 4 }}>👎 気になる点</div><p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>{review.cons}</p></>}
      <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 10, paddingTop: 8, borderTop: '1px solid #f0f4f8' }}>匿名 ／ {new Date(review.created_at).toLocaleDateString('ja-JP')}</div>
    </div>
  )
}
