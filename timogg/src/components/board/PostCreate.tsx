import DropdownMenu from '../common/DropdownMenu';

export default function PostCreate() {
  let navItems = ['자유게시판', '질문게시판', '정보게시판'];
  return (
    <div>
      <h1>글쓰기</h1>

      <div>
        <label>게시판 선택</label>
        <DropdownMenu navItems={navItems} />
      </div>
      <div>
        <label>제목</label>
        <input type="text" placeholder="제목을 입력해주세요" />
      </div>
      <div>
        <label>내용</label>
        <textarea placeholder="내용을 입력해주세요"></textarea>
      </div>
      <div>
        <label>이미지 업로드</label>
        <input type="file" />
      </div>
      <button type="submit">등록</button>
    </div>
    // 게시판 선택 드롭다운 메뉴
    // 등록 버튼
    // 제목 입력
    // 내용 입력
    // 이미지 업로드
  );
}
