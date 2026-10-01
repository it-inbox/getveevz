import React, { useState } from 'react';
import { 
  GraduationCap, 
  Play, 
  Plus, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  Eye
} from 'lucide-react';
import { Course, User, UserRole } from '../../types';

interface CoursesSectionProps {
  courses: Course[];
  currentUser: User;
  onCreateCourse: (course: Partial<Course>) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  courses,
  currentUser,
  onCreateCourse,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Course | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [duration, setDuration] = useState('30 mins');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([
    'CEO',
    'Division_Leader',
    'Campaign_Manager',
  ]);

  const handleToggleRole = (r: UserRole) => {
    if (selectedRoles.includes(r)) {
      setSelectedRoles(selectedRoles.filter((item) => item !== r));
    } else {
      setSelectedRoles([...selectedRoles, r]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCourse({
      title,
      description: desc,
      video_url: videoUrl,
      duration,
      visible_to_roles: selectedRoles,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
    });
    setShowCreateModal(false);
    setTitle('');
    setDesc('');
  };

  const allRoles: UserRole[] = [
    'CEO',
    'Division_Leader',
    'Campaign_Manager',
    'Campaign_Manager_Assistant',
    'Clipper',
    'PR_Manager',
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black font-['Manrope']">Internal Training Academy & Courses</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Role-gated video masterclasses on short-form psychology, quality grading, and financial operations.
          </p>
        </div>

        {currentUser.role === 'CEO' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        )}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses
          .filter((course) => 
            currentUser.role === 'CEO' || 
            !course.visible_to_roles || 
            course.visible_to_roles.length === 0 || 
            course.visible_to_roles.includes(currentUser.role)
          )
          .map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden shadow-xs hover:border-[#0084FF] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail with Play Overlay */}
              <div 
                className="relative aspect-video bg-gray-900 overflow-hidden cursor-pointer group"
                onClick={() => setSelectedVideo(course)}
              >
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#0084FF] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{course.duration || '35 mins'}</span>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-5">
                <h3 className="font-bold text-sm text-black line-clamp-1 leading-snug">{course.title}</h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">{course.description}</p>
                
                {/* Visible Roles Tags */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {course.visible_to_roles.map((r) => (
                    <span key={r} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#E3F2FD] text-[#0084FF]">
                      {r.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-[#E0E0E0]/60 flex items-center justify-between mt-2">
              <span className="text-[11px] text-gray-400">Created by CEO</span>
              <button
                onClick={() => setSelectedVideo(course)}
                className="text-xs font-bold text-[#0084FF] hover:underline flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-[#0084FF]" /> Watch Video
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden border border-[#E0E0E0] shadow-2xl">
            <div className="p-4 border-b border-[#E0E0E0] flex items-center justify-between">
              <h3 className="font-bold text-sm text-black">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={selectedVideo.video_url}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-gray-50 text-xs">
              <p className="font-bold text-black mb-1">Lesson Summary:</p>
              <p className="text-gray-600">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E0E0E0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-base text-black">Create Academy Course</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-black mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mastering Short-Form Virality"
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Video Embed URL (YouTube or Vimeo)</label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 45 mins"
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Visible To Roles (Checkboxes)</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {allRoles.map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border border-[#E0E0E0] hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(r)}
                        onChange={() => handleToggleRole(r)}
                      />
                      <span className="text-[11px] font-medium text-black">{r.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-black mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Summary of learning outcomes..."
                  className="w-full p-2 border border-[#E0E0E0] rounded-xl text-black focus:border-[#0084FF]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-[#E0E0E0] rounded-xl text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0084FF] text-white font-semibold rounded-xl hover:bg-[#0073e6]"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
