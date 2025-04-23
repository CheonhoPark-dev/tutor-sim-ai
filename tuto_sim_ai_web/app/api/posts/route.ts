import { NextResponse } from 'next/server';

const posts = [
  { id: 1, title: 'First Post', content: 'This is the first post content.' },
  { id: 2, title: 'Second Post', content: 'This is the second post content.' },
  { id: 3, title: 'Third Post', content: 'This is the third post content.' },
];

export async function GET() {
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPost = {
      id: posts.length + 1,
      ...body,
    };
    posts.push(newPost);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 400 }
    );
  }
} 