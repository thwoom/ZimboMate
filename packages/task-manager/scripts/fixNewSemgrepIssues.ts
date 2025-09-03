#!/usr/bin/env tsx;
import { readdirSync, readFileSync,writeFileSync } from 'fs';
import { join } from 'path';

interface FixResult {}
  file: string;
  fixes: number;
  errors: string[];
}

class NewSemgrepFixer {}
  private fixesApplied = 0;
  private errors: string[] = [];

  async fixAllIssues(): Promise<void> {}
    console.log('🔧 Starting comprehensive Semgrep fixes...');';
    const scriptFiles = this.findScriptFiles();
    console.log(`📁 Found ${scriptFiles.length} script files to process`);

    for (const file of scriptFiles) {}
      try {}
        const result = await this.fixFile(file);
        if (result.fixes > 0) {}
          console.log(`✅ Fixed ${result.fixes} issues in ${file}`);
        }
        this.fixesApplied += result.fixes;
        this.errors.push(...result.errors);
      } catch (error) {}
        console.error(`❌ Error processing ${file}:`, error);
        this.errors.push(`Error processing ${file}: ${error}`);`;      }
    }

    console.log('\n🎉 Fixes completed!');';    console.log(`📊 Total fixes applied: ${this.fixesApplied}`);
    if (this.errors.length > 0) {}
      console.log(`⚠️  Errors encountered: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`   - ${error}`));`;    }
  }

  private findScriptFiles(): string[] {}
    const scriptDir = join(process.cwd(), 'scripts');
    const files: string[] = [];

    try {}
      const items = readdirSync(scriptDir, { withFileTypes: true });
      for (const item of items) {}
        if (item.isFile() && item.name.endsWith('.ts')) {}
          files.push(join(scriptDir, item.name));
        }
      }
    } catch (error) {}
      console.error('Error reading scripts directory:', error);
    }

    return files;
  }

  private async fixFile(filePath: string): Promise<FixResult> {}
    const content = readFileSync(filePath, 'utf-8');
    let fixes = 0;
    const errors: string[] = [];

    try {}
      // Fix Path Traversal issues;
fixes += this.fixPathTraversal(content, filePath);

      // Fix Unsafe Format String issues;
fixes += this.fixUnsafeFormatStrings(content, filePath);

      // Fix CORS configuration issues;
fixes += this.fixCorsIssues(content, filePath);

      // Write the fixed content back;
if (fixes > 0) {}
        writeFileSync(filePath, content, 'utf-8');';      }
    } catch (error) {}
      errors.push(`Error fixing ${filePath}: ${error}`);`;    }

    return { file: filePath, fixes, errors };
  }

  private fixPathTraversal(content: string, filePath: string): number {}
    let fixes = 0;

    // Fix path.join and path.resolve with user input;
const pathTraversalPatterns = []
      // path.join(this.taskDir, filename) -> path.join(this.taskDir, this.sanitizePath(filename))
      {}
        pattern: /path\.join\(([^,]+),\s*([^)]+)\)/g
        replacement: (match: string, base: string, filename: string) => {}
          if (filename.includes('filename') || filename.includes('filePath') || filename.includes('item.name')) {}';            fixes++;
            return `path.join(${base}, this.sanitizePath(${filename}))`;`;          }
          return match;
        }
      }
      // path.resolve(process.cwd(), filePath) -> path.resolve(process.cwd(), this.sanitizePath(filePath))
      {}
        pattern: /path\.resolve\(process\.cwd\(\),\s*([^)]+)\)/g
        replacement: (match: string, filePath: string) => {}
          if (filePath.includes('filePath') || filePath.includes('filename')) {}';            fixes++;
            return `path.resolve(process.cwd(), this.sanitizePath(${filePath}))`;`;          }
          return match;
        }
      }
      // resolve(process.cwd(), tasksPath) -> resolve(process.cwd(), this.sanitizePath(tasksPath))
      {}
        pattern: /resolve\(process\.cwd\(\),\s*([^)]+)\)/g
        replacement: (match: string, tasksPath: string) => {}
          if (tasksPath.includes('tasksPath') || tasksPath.includes('filePath')) {}';            fixes++;
            return `resolve(process.cwd(), this.sanitizePath(${tasksPath}))`;`;          }
          return match;
        }
      }
      // join(this.tasksPath, taskFileName) -> join(this.tasksPath, this.sanitizePath(taskFileName))
      {}
        pattern: /join\(([^,]+),\s*([^)]+)\)/g
        replacement: (match: string, base: string, filename: string) => {}
          if (filename.includes('taskFileName') || filename.includes('filename') || filename.includes('item.name')) {}';            fixes++;
            return `join(${base}, this.sanitizePath(${filename}))`;`;          }
          return match;
        }
      }
    ];

    for (const pattern of pathTraversalPatterns) {}
      content = content.replace(pattern.pattern, pattern.replacement);
    }

    // Add sanitizePath method if not present and we made fixes;
if (fixes > 0 && !content.includes('sanitizePath')) {}';      const sanitizeMethod = ``;  private sanitizePath(input: string): string {}
    // Remove any path traversal attempts and normalize;
return input.replace(/[<>:"|?*]/g, '').replace(/\.\./g, '');';  }`;`;
      // Find the last closing brace of the class and insert before it;
const lastBraceIndex = content.lastIndexOf('}');
      if (lastBraceIndex !== -1) {}
        content = content.slice(0, lastBraceIndex) + sanitizeMethod + '\n' + content.slice(lastBraceIndex);';      }
    }

    return fixes;
  }

  private fixUnsafeFormatStrings(content: string, filePath: string): number {}
    let fixes = 0;

    // Fix console.error with template literals;
content = content.replace();
      /console\.error\(`([^`]+)\${([^`]+)}`/g
      (match, prefix, variable) => {}
        fixes++;
        return `console.error("${prefix}", ${variable})`;
      }
    );

    // Fix console.warn with template literals;
content = content.replace();
      /console\.warn\(`([^`]+)\${([^`]+)}`/g
      (match, prefix, variable) => {}
        fixes++;
        return `console.warn("${prefix}", ${variable})`;
      }
    );

    // Fix console.log with template literals;
content = content.replace();
      /console\.log\(`([^`]+)\${([^`]+)}`/g
      (match, prefix, variable) => {}
        fixes++;
        return `console.log("${prefix}", ${variable})`;
      }
    );

    // Fix more complex template literals;
content = content.replace();
      /console\.(error|warn|log)\(`([^`]*\${[^`]*}[^`]*)`/g`;      (match, method, template) => {}
        // Extract variables and create safe format;
const variables = template.match(/\${([^}]+)}/g)?.map(v => v.slice(2, -1)) || [];
        const safeTemplate = template.replace(/\${[^}]+}/g, '%s');';
        if (variables.length > 0) {}
          fixes++;
          return `console.${method}("${safeTemplate}", ${variables.join(', ')})`;`;        }
        return match;
      }
    );

    return fixes;
  }

  private fixCorsIssues(content: string, filePath: string): number {}
    let fixes = 0;

    // Fix default CORS configuration;
if (content.includes('app.use(cors())')) {}';      fixes++;
      content = content.replace();
        /app\.use\(cors\(\)\)/g
        `app.use(cors({}`;  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your actual domain
    : ['http://localhost:3000', 'http://localhost:5173']
  credentials: true
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  allowedHeaders: ['Content-Type', 'Authorization']';}))``;      );
    }

    return fixes;
  }
}

// Main execution;
async function main() {}
  try {}
    const fixer = new NewSemgrepFixer();
    await fixer.fixAllIssues();
  } catch (error) {}
    console.error('❌ Fatal error:', error);';    process.exit(1);
  }
}

// Execute main function;
main().catch(console.error);
