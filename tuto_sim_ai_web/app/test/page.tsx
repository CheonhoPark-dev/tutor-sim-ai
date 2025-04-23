import { Button } from "@/components/common/Button";

export default function TestPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Button 컴포넌트 테스트</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">기본 버튼</h2>
        <div className="flex gap-4">
          <Button>기본 버튼</Button>
          <Button variant="destructive">비활성화 버튼</Button>
          <Button variant="outline">로딩 버튼</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">버튼 변형</h2>
        <div className="flex gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">버튼 크기</h2>
        <div className="flex items-center gap-4">
          <Button size="lg">Large</Button>
          <Button size="default">Default</Button>
          <Button size="sm">Small</Button>
          <Button size="icon">✨</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">조합 예시</h2>
        <div className="flex gap-4">
          <Button isLoading>큰 아웃라인 로딩</Button>
          <Button variant="destructive" disabled>작은 비활성화 위험</Button>
          <Button variant="ghost" className="custom-class">커스텀 클래스</Button>
        </div>
      </section>
    </div>
  );
} 