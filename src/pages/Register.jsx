import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { registerUser } from '../utils/auth'
import LoadingSpinner from '../components/LoadingSpinner'
import FloatingShapes from '../components/FloatingShapes'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await registerUser(name, email, password)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { icon: User, type: 'text', placeholder: 'Full Name', value: name, set: setName, id: 'register-name' },
    { icon: Mail, type: 'email', placeholder: 'Email address', value: email, set: setEmail, id: 'register-email' },
    { icon: Lock, type: 'password', placeholder: 'Password', value: password, set: setPassword, id: 'register-password' },
    { icon: Lock, type: 'password', placeholder: 'Confirm Password', value: confirmPassword, set: setConfirmPassword, id: 'register-confirm' },
  ]

  return (
    <div className="gradient-bg flex items-center justify-center px-4 py-8 relative">
      <FloatingShapes />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card w-full max-w-md p-8 md:p-10 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm">Join NexusForge AI and start building</p>
        </motion.div>

        <form onSubmit={handleRegister} className="space-y-4">
          {fields.map((field, i) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="relative"
            >
              <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                className="input-field"
                id={field.id}
              />
            </motion.div>
          ))}

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            id="register-submit"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Create Account
              </span>
            )}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-slate-400"
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-light hover:text-primary font-medium transition-colors"
            id="register-login-link"
          >
            Login
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
