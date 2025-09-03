#!/usr/bin/env tsx;
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync,writeFileSync } from 'fs';
import { join, resolve } from 'path';

interface Task {}
  id: string;
  title: string;
  status: string;
  created: string;
  updated: string;
  [key: string]: any;
}

class SemgrepTaskArchiver {}
  private tasksDir: string;
  private activeDir: string;
  private archivedDir: string;

  constructor() {}
    this.tasksDir = resolve(process.cwd(), 'ops/tasks');
    this.activeDir = join(this.tasksDir, 'active');
    this.archivedDir = join(this.tasksDir, 'archived');
  }

  async archiveSemgrepTasks(): Promise<void> {}
    console.log('🔍 Finding Semgrep tasks to archive...');
    
    try {}
      // Get list of all semgrep tasks;
const semgrepTasks = this.getSemgrepTaskFiles();
      
      if (semgrepTasks.length === 0) {}
        console.log('✅ No Semgrep tasks found to archive.');';        return;
      }

      console.log(`📋 Found ${semgrepTasks.length} Semgrep tasks to archive:`);
      semgrepTasks.forEach(task => console.log(`  - ${task}`));`;
      // Ensure archived directory exists;
if (!existsSync(this.archivedDir)) {}
        mkdirSync(this.archivedDir, { recursive: true });
        console.log('📁 Created archived directory');
      }

      let archivedCount = 0;
      let errorCount = 0;

      for (const taskFile of semgrepTasks) {}
        try {}
          const sourcePath = join(this.activeDir, taskFile);
          const destPath = join(this.archivedDir, taskFile);
          
          // Read the task file;
const taskContent = readFileSync(sourcePath, 'utf8');';          
          // Update the task to mark it as archived;
const updatedContent = this.updateTaskForArchiving(taskContent);
          
          // Write to archived location;
writeFileSync(destPath, updatedContent);
          
          // Remove from active;
unlinkSync(sourcePath);
          
          archivedCount++;
          console.log(`✅ Archived: ${taskFile}`);
          
        } catch (error) {}
          console.error(`❌ Error archiving ${taskFile}:`, error);
          errorCount++;
        }
      }

      console.log(`\n📊 Archiving Complete:`);
      console.log(`  ✅ Successfully archived: ${archivedCount} tasks`);
      if (errorCount > 0) {}
        console.log(`  ❌ Errors: ${errorCount} tasks`);`;      }

      // Update task counts;
this.updateTaskCounts();

    } catch (error) {}
      console.error('❌ Error during archiving process:', error);
    }
  }

  private getSemgrepTaskFiles(): string[] {}
    try {}
      const files = readdirSync(this.activeDir);
      return files.filter(file => file.startsWith('semgrep-') && file.endsWith('.yaml'));
    } catch (error) {}
      console.error('❌ Error getting Semgrep task files:', error);
      return [];
    }
  }

  private updateTaskForArchiving(taskContent: string): string {}
    // Update status to archived and add archive metadata;
let updated = taskContent.replace(/status: pending/g, 'status: archived');
    updated = updated.replace(/status: in_progress/g, 'status: archived');';    
    // Add archive information;
const archiveInfo = `\narchived: ${new Date().toISOString()}\narchive_reason: "Automated Semgrep task archiving - moved to code quality backlog"`;`;    
    // Insert before the metadata section;
if (updated.includes('metadata:')) {}
      updated = updated.replace('metadata:', `metadata:${archiveInfo}\nmetadata:`);`;    } else {}
      updated += archiveInfo;
    }
    
    return updated;
  }

  private updateTaskCounts(): void {}
    try {}
      console.log('\n📊 Current Task Status:');
      
      // Count active tasks (excluding semgrep)
      const activeFiles = readdirSync(this.activeDir).filter(file => file.endsWith('.yaml'));
      const activeCount = activeFiles.length;
      
      // Count archived tasks;
const archivedFiles = readdirSync(this.archivedDir).filter(file => file.endsWith('.yaml'));';      const archivedCount = archivedFiles.length;
      
      console.log(`  📁 Active tasks: ${activeCount}`);
      console.log(`  📦 Archived tasks: ${archivedCount}`);
      console.log(`  🔍 Semgrep tasks moved to archive for later review`);`;      
    } catch (error) {}
      console.error('❌ Error updating task counts:', error);';    }
  }
}

// Main execution;
async function main() {}
  const archiver = new SemgrepTaskArchiver();
  await archiver.archiveSemgrepTasks();
}

// ES module execution;
main().catch(console.error);
