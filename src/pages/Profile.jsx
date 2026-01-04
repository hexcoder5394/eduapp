import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { updateUserProfile } from '../lib/db';
import { User, Briefcase, Save, Check } from 'lucide-react';

const Profile = () => {
  const { user } = UserAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', profession: '', age: '', photoUrl: ''
  });

  // Load existing data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profession: user.profession || '',
        age: user.age || '',
        photoUrl: user.photoUrl || ''
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(user.uid, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success msg after 3s
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-100 mb-8">Your Profile</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* Profile Picture Input */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Profile Image URL</label>
            <div className="flex gap-4 items-center">
              <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="text-slate-500" size={32} />
                )}
              </div>
              <input 
                type="text" 
                placeholder="https://example.com/my-photo.jpg"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500"
                value={formData.photoUrl}
                onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">First Name</label>
              <input 
                type="text" 
                required 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Last Name</label>
              <input 
                type="text" 
                required 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Profession</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 outline-none focus:border-indigo-500"
                  value={formData.profession}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Age</label>
              <input 
                type="number" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className={`mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              success ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {success ? <><Check size={20}/> Saved Successfully</> : <><Save size={20}/> Save Changes</>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Profile;