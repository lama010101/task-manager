import { Task } from '@/types/database';

export type ParsedTask = Omit<Task, 'id' | 'project_id' | 'created_at'>;

/**
 * Parses PRD text into structured task objects
 */
export async function parsePrdToTasks(prdText: string): Promise<ParsedTask[]> {
  try {
    // Simple parser to extract tasks from PRD
    // In a real implementation, you might use an API call to a language model
    
    const lines = prdText.split('\n');
    const tasks: ParsedTask[] = [];
    
    let currentTask: Partial<ParsedTask> | null = null;
    let inTaskBlock = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for task markers - this is a simple implementation
      if (trimmedLine.match(/^(#|\*|\-|[0-9]+\.)\s+(Task|TODO|Feature):/i) || 
          trimmedLine.match(/^Task\s+[0-9]+:/i)) {
        
        // Save previous task if exists
        if (currentTask?.title) {
          tasks.push({
            title: currentTask.title,
            description: currentTask.description || '',
            priority: currentTask.priority || 'medium',
            status: 'todo',
            role: currentTask.role || null,
          });
        }
        
        // Start new task
        currentTask = {
          title: trimmedLine.replace(/^(#|\*|\-|[0-9]+\.)\s+(Task|TODO|Feature):\s*/i, '')
                          .replace(/^Task\s+[0-9]+:\s*/i, ''),
          description: '',
          priority: 'medium',
          status: 'todo',
        };
        inTaskBlock = true;
        
      } else if (inTaskBlock && currentTask) {
        // Look for priority markers
        if (trimmedLine.match(/priority:\s*(high|medium|low)/i)) {
          const priority = trimmedLine.match(/priority:\s*(high|medium|low)/i)?.[1].toLowerCase();
          currentTask.priority = (priority as 'high' | 'medium' | 'low') || 'medium';
        } 
        // Look for role markers
        else if (trimmedLine.match(/role:\s*([^,;]+)/i)) {
          currentTask.role = trimmedLine.match(/role:\s*([^,;]+)/i)?.[1].trim() || null;
        } 
        // Add to description if not an empty line
        else if (trimmedLine && !trimmedLine.startsWith('---')) {
          if (currentTask.description) {
            currentTask.description += '\n' + trimmedLine;
          } else {
            currentTask.description = trimmedLine;
          }
        }
        
        // End of task block
        if (trimmedLine === '---' || trimmedLine.startsWith('===')) {
          inTaskBlock = false;
        }
      }
    }
    
    // Add final task if exists
    if (currentTask?.title) {
      tasks.push({
        title: currentTask.title,
        description: currentTask.description || '',
        priority: currentTask.priority || 'medium',
        status: 'todo',
        role: currentTask.role || null,
      });
    }
    
    // If no tasks were found with the simple parser, try a more general approach
    if (tasks.length === 0) {
      // Split by double newlines to find paragraphs
      const paragraphs = prdText.split(/\n\s*\n/);
      
      for (const paragraph of paragraphs) {
        if (paragraph.length > 10 && paragraph.length < 200) {
          // Use first line as title, rest as description
          const lines = paragraph.split('\n');
          const title = lines[0].trim();
          
          if (title && !title.match(/^(#|\*|\-|=)/)) {
            const description = lines.slice(1).join('\n').trim();
            
            tasks.push({
              title,
              description,
              priority: title.toLowerCase().includes('urgent') ? 'high' : 'medium',
              status: 'todo',
              role: null,
            });
          }
        }
      }
    }
    
    return tasks;
  } catch (error) {
    console.error('Error parsing PRD:', error);
    return [];
  }
} 