'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/database';

type TaskBoardProps = {
  tasks: Task[];
  onTasksUpdated: () => void;
};

export default function TaskBoard({ tasks, onTasksUpdated }: TaskBoardProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Group tasks by status
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const updateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    setUpdatingTaskId(taskId);
    setError(null);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task status:', error);
        setError(error.message);
        return;
      }

      onTasksUpdated();
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const TaskColumn = ({ title, tasks, status }: { title: string; tasks: Task[]; status: 'todo' | 'in_progress' | 'completed' }) => (
    <div className="bg-gray-50 rounded-lg p-4 flex-1">
      <h3 className="font-medium text-lg mb-3">{title} ({tasks.length})</h3>
      {tasks.length === 0 ? (
        <div className="text-gray-500 text-sm italic">No tasks</div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow p-3 border-l-4 border-l-blue-500"
            >
              <h4 className="font-medium mb-1">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
                {task.role && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {task.role}
                  </span>
                )}
              </div>
              <div className="flex gap-1 justify-end">
                {status !== 'todo' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'todo')}
                    disabled={updatingTaskId === task.id}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    To Do
                  </button>
                )}
                {status !== 'in_progress' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                    disabled={updatingTaskId === task.id}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
                  >
                    In Progress
                  </button>
                )}
                {status !== 'completed' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    disabled={updatingTaskId === task.id}
                    className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded"
                  >
                    Done
                  </button>
                )}
              </div>
              {updatingTaskId === task.id && (
                <div className="text-center py-1">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TaskColumn title="To Do" tasks={todoTasks} status="todo" />
        <TaskColumn title="In Progress" tasks={inProgressTasks} status="in_progress" />
        <TaskColumn title="Done" tasks={completedTasks} status="completed" />
      </div>
    </div>
  );
} 