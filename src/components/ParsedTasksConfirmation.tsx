'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ParsedTask } from '@/utils/prdParser';
import Modal from './Modal';

type ParsedTasksConfirmationProps = {
  isOpen: boolean;
  onClose: () => void;
  parsedTasks: ParsedTask[];
  projectId: string;
  onTasksInserted: () => void;
};

export default function ParsedTasksConfirmation({
  isOpen,
  onClose,
  parsedTasks,
  projectId,
  onTasksInserted
}: ParsedTasksConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editableTasks, setEditableTasks] = useState<ParsedTask[]>(parsedTasks);

  const handleTaskChange = (index: number, field: keyof ParsedTask, value: string) => {
    const updatedTasks = [...editableTasks];
    if (field === 'priority') {
      updatedTasks[index][field] = value as 'low' | 'medium' | 'high';
    } else if (field === 'status') {
      updatedTasks[index][field] = value as 'todo' | 'in_progress' | 'completed';
    } else {
      // @ts-ignore - TypeScript doesn't know we're handling other fields correctly
      updatedTasks[index][field] = value;
    }
    setEditableTasks(updatedTasks);
  };

  const handleConfirm = async () => {
    if (editableTasks.length === 0) {
      setError('No tasks to insert');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Insert each task into Supabase
      const { error } = await supabase
        .from('tasks')
        .insert(
          editableTasks.map(task => ({
            ...task,
            project_id: projectId
          }))
        );

      if (error) {
        console.error('Error inserting tasks:', error);
        setError(error.message);
        return;
      }

      onTasksInserted();
      onClose();
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Tasks from PRD">
      <div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <p className="mb-4 text-gray-600">
          {editableTasks.length} tasks were parsed from the PRD. Review and edit them before inserting into the project.
        </p>
        
        <div className="max-h-96 overflow-y-auto mb-6">
          {editableTasks.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-700">
              No tasks could be parsed from the PRD.
            </div>
          ) : (
            <div className="space-y-4">
              {editableTasks.map((task, index) => (
                <div key={index} className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-3 flex justify-between items-center">
                    <h3 className="font-medium">Task {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditableTasks(editableTasks.filter((_, i) => i !== index));
                      }}
                      className="text-red-600 hover:text-red-800"
                      disabled={isSubmitting}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <label htmlFor={`title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        id={`title-${index}`}
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id={`description-${index}`}
                        value={task.description}
                        onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={2}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`priority-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          id={`priority-${index}`}
                          value={task.priority}
                          onChange={(e) => handleTaskChange(index, 'priority', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={isSubmitting}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`role-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <input
                          id={`role-${index}`}
                          type="text"
                          value={task.role || ''}
                          onChange={(e) => handleTaskChange(index, 'role', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            disabled={isSubmitting || editableTasks.length === 0}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : `Save ${editableTasks.length} Tasks`}
          </button>
        </div>
      </div>
    </Modal>
  );
} 