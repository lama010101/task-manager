export type Project = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  role?: string;
  created_at: string;
}; 