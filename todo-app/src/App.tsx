import { useState, useEffect } from 'react'
import { 
  Authenticator,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  TextField,
  TextAreaField,
  SelectField,
  Badge,
  View,
  useTheme,
  Divider
} from '@aws-amplify/ui-react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../amplify/data/resource'
import '@aws-amplify/ui-react/styles.css'
import './App.css'

const client = generateClient<Schema>()

function Sidebar() {
  const { tokens } = useTheme()
  
  return (
    <View
      backgroundColor={tokens.colors.background.secondary}
      padding={tokens.space.medium}
      width="250px"
      height="100vh"
      position="fixed"
      left="0"
      top="0"
    >
      <Heading level={4} color={tokens.colors.font.primary}>
        📋 Todo Manager
      </Heading>
      <Divider marginTop={tokens.space.medium} marginBottom={tokens.space.medium} />
      <Flex direction="column" gap={tokens.space.small}>
        <Text fontWeight="bold">📊 統計</Text>
        <Text fontSize={tokens.fontSizes.small}>今日のタスク</Text>
        <Text fontSize={tokens.fontSizes.small}>進行中のタスク</Text>
        <Text fontSize={tokens.fontSizes.small}>完了したタスク</Text>
      </Flex>
    </View>
  )
}

function Header({ user, signOut }: { user: any, signOut: () => void }) {
  const { tokens } = useTheme()
  
  return (
    <View
      backgroundColor={tokens.colors.background.primary}
      padding={tokens.space.medium}
      marginLeft="250px"
      borderBottom={`1px solid ${tokens.colors.border.primary}`}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={3}>Todo アプリケーション</Heading>
        <Flex alignItems="center" gap={tokens.space.medium}>
          <Text>こんにちは、{user?.signInDetails?.loginId}さん！</Text>
          <Button variation="link" onClick={signOut}>
            サインアウト
          </Button>
        </Flex>
      </Flex>
    </View>
  )
}

function TodoForm({ onSubmit }: { onSubmit: (todo: any) => void }) {
  const { tokens } = useTheme()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending')
  const [category, setCategory] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      status,
      category: category.split(',').map(c => c.trim()).filter(c => c)
    })

    setTitle('')
    setContent('')
    setCategory('')
    setStatus('pending')
  }

  return (
    <Card variation="elevated" padding={tokens.space.large}>
      <Heading level={4} marginBottom={tokens.space.medium}>
        ✨ 新しいTodoを追加
      </Heading>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={tokens.space.medium}>
          <TextField
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="タスクのタイトルを入力"
          />
          <TextAreaField
            label="内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="タスクの詳細を入力"
            rows={3}
          />
          <Grid templateColumns="1fr 1fr" gap={tokens.space.medium}>
            <SelectField
              label="ステータス"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="pending">📋 未着手</option>
              <option value="in_progress">⚡ 進行中</option>
              <option value="completed">✅ 完了</option>
            </SelectField>
            <TextField
              label="カテゴリ"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="仕事, 個人 (カンマ区切り)"
            />
          </Grid>
          <Button type="submit" variation="primary" size="large">
            📝 Todoを追加
          </Button>
        </Flex>
      </form>
    </Card>
  )
}

function TodoItem({ todo, onUpdate, onDelete }: { 
  todo: Schema["Todo"]["type"], 
  onUpdate: (id: string, status: any) => void,
  onDelete: (id: string) => void 
}) {
  const { tokens } = useTheme()
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '📋'
      case 'in_progress': return '⚡'
      case 'completed': return '✅'
      default: return '📋'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'in_progress': return 'info'
      case 'completed': return 'success'
      default: return 'neutral'
    }
  }

  return (
    <Card variation="outlined" padding={tokens.space.medium}>
      <Flex direction="column" gap={tokens.space.small}>
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Heading level={5}>{getStatusIcon(todo.status || 'pending')} {todo.title}</Heading>
          <Badge variation={getStatusColor(todo.status || 'pending')}>
            {todo.status === 'pending' ? '未着手' :
             todo.status === 'in_progress' ? '進行中' : '完了'}
          </Badge>
        </Flex>
        
        <Text color={tokens.colors.font.secondary}>{todo.content}</Text>
        
        {todo.category && todo.category.length > 0 && (
          <Flex gap={tokens.space.xs} wrap="wrap">
            {todo.category.map((cat, index) => (
              <Badge key={index} variation="neutral" size="small">
                🏷️ {cat}
              </Badge>
            ))}
          </Flex>
        )}
        
        <Divider marginTop={tokens.space.small} marginBottom={tokens.space.small} />
        
        <Flex justifyContent="space-between" alignItems="center">
          <SelectField
            label=""
            value={todo.status || 'pending'}
            onChange={(e) => onUpdate(todo.id, e.target.value)}
            size="small"
          >
            <option value="pending">📋 未着手</option>
            <option value="in_progress">⚡ 進行中</option>
            <option value="completed">✅ 完了</option>
          </SelectField>
          <Button
            variation="destructive"
            size="small"
            onClick={() => onDelete(todo.id)}
          >
            🗑️ 削除
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}

function TodoApp() {
  const { tokens } = useTheme()
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([])

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const { data: items } = await client.models.Todo.list()
    setTodos(items)
  }

  const createTodo = async (todoData: any) => {
    await client.models.Todo.create(todoData)
    fetchTodos()
  }

  const updateTodoStatus = async (id: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    await client.models.Todo.update({ id, status: newStatus })
    fetchTodos()
  }

  const deleteTodo = async (id: string) => {
    await client.models.Todo.delete({ id })
    fetchTodos()
  }

  return (
    <View marginLeft="250px" padding={tokens.space.large}>
      <Flex direction="column" gap={tokens.space.large}>
        <TodoForm onSubmit={createTodo} />
        
        <View>
          <Heading level={4} marginBottom={tokens.space.medium}>
            📝 あなたのTodoリスト ({todos.length}件)
          </Heading>
          
          {todos.length === 0 ? (
            <Card padding={tokens.space.large} textAlign="center">
              <Text fontSize={tokens.fontSizes.large}>📭</Text>
              <Text>まだTodoがありません。上のフォームから追加してみましょう！</Text>
            </Card>
          ) : (
            <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={tokens.space.medium}>
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={updateTodoStatus}
                  onDelete={deleteTodo}
                />
              ))}
            </Grid>
          )}
        </View>
      </Flex>
    </View>
  )
}

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <View>
          <Sidebar />
          <Header user={user} signOut={signOut} />
          <TodoApp />
        </View>
      )}
    </Authenticator>
  )
}

export default App
