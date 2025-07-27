import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { taskDB } from '../database/supabase.js';

class TaskManagerServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'taskmanager-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 모든 태스크 조회
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_all_tasks',
            description: '모든 태스크를 조회합니다',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'add_task',
            description: '새로운 태스크를 추가합니다',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: '태스크 제목',
                },
                description: {
                  type: 'string',
                  description: '태스크 설명',
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: '우선순위',
                },
                dueDate: {
                  type: 'string',
                  description: '마감일 (ISO 문자열)',
                },
                repeatDays: {
                  type: 'array',
                  items: { type: 'number' },
                  description: '반복 요일 (0=일요일, 1=월요일, ..., 6=토요일)',
                },
              },
              required: ['title', 'priority'],
            },
          },
          {
            name: 'update_task',
            description: '태스크를 업데이트합니다',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: '태스크 ID',
                },
                title: {
                  type: 'string',
                  description: '태스크 제목',
                },
                description: {
                  type: 'string',
                  description: '태스크 설명',
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: '우선순위',
                },
                status: {
                  type: 'string',
                  enum: ['pending', 'completed'],
                  description: '태스크 상태',
                },
                dueDate: {
                  type: 'string',
                  description: '마감일 (ISO 문자열)',
                },
                repeatDays: {
                  type: 'array',
                  items: { type: 'number' },
                  description: '반복 요일',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'delete_task',
            description: '태스크를 삭제합니다',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: '태스크 ID',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'get_tasks_by_date',
            description: '특정 날짜의 태스크를 조회합니다',
            inputSchema: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  description: '날짜 (YYYY-MM-DD 형식)',
                },
              },
              required: ['date'],
            },
          },
          {
            name: 'get_repeat_tasks',
            description: '반복 태스크를 조회합니다',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // 도구 실행 핸들러
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        return {
          content: [
            {
              type: 'text',
              text: 'Arguments are required',
            },
          ],
          isError: true,
        };
      }

      try {
        switch (name) {
          case 'get_all_tasks': {
            const tasks = await taskDB.getAllTasks();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(tasks, null, 2),
                },
              ],
            };
          }

          case 'add_task': {
            const task = {
              id: Date.now().toString(),
              title: args.title as string,
              description: (args.description as string) || '',
              priority: args.priority as 'low' | 'medium' | 'high',
              status: 'pending' as const,
              dueDate: (args.dueDate as string) || undefined,
              createdAt: new Date().toISOString(),
              completedAt: undefined,
              repeatDays: (args.repeatDays as number[]) || undefined,
            };

            await taskDB.addTask(task);
            return {
              content: [
                {
                  type: 'text',
                  text: `태스크가 성공적으로 추가되었습니다: ${task.title}`,
                },
              ],
            };
          }

          case 'update_task': {
            const updates: any = {};
            if (args.title !== undefined) updates.title = args.title;
            if (args.description !== undefined) updates.description = args.description;
            if (args.priority !== undefined) updates.priority = args.priority;
            if (args.status !== undefined) updates.status = args.status;
            if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
            if (args.repeatDays !== undefined) {
              updates.repeatDays = args.repeatDays;
            }

            await taskDB.updateTask(args.id as string, updates);
            return {
              content: [
                {
                  type: 'text',
                  text: `태스크가 성공적으로 업데이트되었습니다: ${args.id}`,
                },
              ],
            };
          }

          case 'delete_task': {
            await taskDB.deleteTask(args.id as string);
            return {
              content: [
                {
                  type: 'text',
                  text: `태스크가 성공적으로 삭제되었습니다: ${args.id}`,
                },
              ],
            };
          }

          case 'get_tasks_by_date': {
            const tasks = await taskDB.getTasksByDate(args.date as string);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(tasks, null, 2),
                },
              ],
            };
          }

          case 'get_repeat_tasks': {
            const tasks = await taskDB.getRepeatTasks();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(tasks, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('MCP Server is running...');
  }
}

// 서버 실행
const server = new TaskManagerServer();
server.run().catch(console.error); 