import { NextResponse } from 'next/server';

type Post = {
  id: number;
  title: string;
  content: string;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const postId = Number(params.id);

  // 샘플 데이터
  if (postId > 0 && postId <= 10) {
    return NextResponse.json({
      id: postId,
      title: `게시물 ${postId}의 제목`,
      content: `게시물 ${postId}의 내용입니다. 이것은 샘플 데이터입니다.`,
    });
  } else {
    return NextResponse.json(
      { message: '게시물을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }
} 