import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
function Community() {
    // 게시물 목록 상태
    const [postList, setPostList] = useState([]);
    // 현재 페이지 번호
    const [currentPage, setCurrentPage] = useState(1);
    // 로딩 중인지 여부
    const [isLoading, setIsLoading] = useState(false);
    // 더 불러올 데이터가 있는지 여부
    const [hasMoreData, setHasMoreData] = useState(true);
    // 선택된 게시물 (모달용)
    const [selectedPostData, setSelectedPostData] = useState(null);
    // 무한 스크롤을 감지할 요소
    const scrollObserverTarget = useRef(null);
    // 가짜 게시물 데이터를 생성하는 함수
    const createFakePosts = (pageNumber) => {
        const newPostList = [];
        // 5개의 게시물 생성
        for (let index = 0; index < 5; index++) {
            const postNumber = (pageNumber - 1) * 5 + index + 1;
            const hasImage = Math.random() > 0.4; // 60% 확률로 이미지 있음
            newPostList.push({
                id: postNumber,
                userName: `FitAI 사용자${postNumber}`,
                timeAgo: `${Math.floor(Math.random() * 60) + 1}분전`,
                postContent: [
                    "오늘의 운동🔥",
                    "스쿼트 100개 완료!💪",
                    "아침 러닝 완료😊",
                    "플랭크 3분 성공!",
                    "홈트 시작합니다!",
                    "운동 후 스트레칭",
                ][Math.floor(Math.random() * 6)],
                hasImage: hasImage,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
            });
        }
        return newPostList;
    };
    // 컴포넌트가 처음 렌더링될 때 초기 데이터 불러오기
    useEffect(() => {
        setPostList(createFakePosts(1));
    }, []);
    // 더 많은 게시물을 불러오는 함수
    const loadMorePosts = () => {
        // 이미 로딩 중이거나 더 이상 데이터가 없으면 중단
        if (isLoading || !hasMoreData)
            return;
        setIsLoading(true);
        // 서버 요청을 시뮬레이션 (1초 후에 데이터 로드)
        setTimeout(() => {
            const nextPageNumber = currentPage + 1;
            const newPosts = createFakePosts(nextPageNumber);
            // 기존 게시물 목록에 새 게시물 추가
            setPostList((previousPosts) => [...previousPosts, ...newPosts]);
            setCurrentPage(nextPageNumber);
            setIsLoading(false);
            // 10페이지(50개 게시물) 이후에는 더 이상 로드하지 않음
            if (nextPageNumber >= 10) {
                setHasMoreData(false);
            }
        }, 1000);
    };
    // 무한 스크롤 감지 설정
    useEffect(() => {
        // Intersection Observer: 특정 요소가 화면에 보이는지 감지하는 브라우저 API
        const scrollObserver = new IntersectionObserver((entries) => {
            // 타겟 요소가 화면에 보이면 더 많은 데이터 로드
            if (entries[0].isIntersecting && hasMoreData && !isLoading) {
                loadMorePosts();
            }
        }, { threshold: 0.1 } // 요소의 10%가 보이면 감지
        );
        // 관찰 시작
        if (scrollObserverTarget.current) {
            scrollObserver.observe(scrollObserverTarget.current);
        }
        // 컴포넌트가 사라질 때 관찰 중단
        return () => {
            if (scrollObserverTarget.current) {
                scrollObserver.unobserve(scrollObserverTarget.current);
            }
        };
    }, [isLoading, hasMoreData, currentPage]);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-[#1E1F23] text-white min-h-screen pb-20", children: [_jsxs("div", { className: "max-w-7xl mx-auto px-8 py-12", children: [_jsx("div", { className: "space-y-4", children: postList.map((post) => (_jsxs("div", { className: "bg-[#2A2B30] rounded-2xl overflow-hidden cursor-pointer hover:bg-[#33343a] transition", onClick: () => setSelectedPostData(post), children: [_jsxs("div", { className: "flex items-center justify-between p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-sm", children: "\uD83D\uDC64" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-sm", children: post.userName }), _jsx("div", { className: "text-xs text-gray-400", children: post.timeAgo })] })] }), _jsx("button", { className: "text-gray-400 text-xl", onClick: (event) => event.stopPropagation(), children: "\u22EF" })] }), _jsx("div", { className: "px-4 pb-3", children: _jsx("p", { className: "text-sm", children: post.postContent }) }), post.hasImage && (_jsx("div", { className: "bg-gray-700 h-64 flex items-center justify-center text-gray-500", children: "[\uC774\uBBF8\uC9C0]" })), _jsx("div", { className: "px-4 py-2 text-xs text-gray-400", children: _jsx("span", { children: "\uC544\uC9C1 \uB313\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" }) }), _jsxs("div", { className: "flex items-center justify-around py-3 border-t border-gray-700", children: [_jsxs("button", { className: "flex flex-col items-center gap-1 text-gray-400 hover:text-white transition", onClick: (event) => event.stopPropagation(), children: [_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" }) }), _jsx("span", { className: "text-xs", children: post.likeCount })] }), _jsxs("button", { className: "flex flex-col items-center gap-1 text-gray-400 hover:text-white transition", onClick: (event) => event.stopPropagation(), children: [_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), _jsx("span", { className: "text-xs", children: post.commentCount })] }), _jsxs("button", { className: "flex flex-col items-center gap-1 text-gray-400 hover:text-white transition", onClick: (event) => event.stopPropagation(), children: [_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" }) }), _jsx("span", { className: "text-xs", children: post.shareCount })] })] })] }, post.id))) }), isLoading && (_jsx("div", { className: "flex justify-center items-center py-8", children: _jsxs("div", { className: "text-gray-400 flex items-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-5 w-5", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _jsx("span", { children: "\uBD88\uB7EC\uC624\uB294 \uC911..." })] }) })), !hasMoreData && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "\uBAA8\uB4E0 \uAC8C\uC2DC\uBB3C\uC744 \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4" })), _jsx("div", { ref: scrollObserverTarget, className: "h-4" })] }), _jsx("button", { className: "fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 4v16m8-8H4" }) }) })] }), selectedPostData && (_jsxs("div", { className: "fixed inset-0 bg-[#1E1F23] z-50 overflow-y-auto flex flex-col", children: [_jsx("div", { className: "bg-[#1E1F23] border-b border-gray-700", children: _jsx("div", { className: "max-w-7xl mx-auto px-8 h-18 flex items-center", children: _jsxs("button", { onClick: () => setSelectedPostData(null), className: "text-white hover:text-orange-500 transition flex items-center gap-2", children: [_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 19l-7-7 7-7" }) }), _jsx("span", { children: "\uB4A4\uB85C\uAC00\uAE30" })] }) }) }), _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "max-w-7xl mx-auto pb-20 px-8 py-6", children: [_jsxs("div", { className: "bg-[#2A2B30]", children: [_jsxs("div", { className: "flex items-center justify-between p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-sm", children: "\uD83D\uDC64" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-sm text-white", children: selectedPostData.userName }), _jsx("div", { className: "text-xs text-gray-400", children: selectedPostData.timeAgo })] })] }), _jsx("button", { className: "text-gray-400 text-xl", children: "\u22EF" })] }), _jsx("div", { className: "px-4 pb-3", children: _jsx("p", { className: "text-sm text-white", children: selectedPostData.postContent }) }), selectedPostData.hasImage && (_jsx("div", { className: "bg-gray-700 h-96 flex items-center justify-center text-gray-500", children: "[\uC774\uBBF8\uC9C0]" })), _jsx("div", { className: "px-4 py-2 text-xs text-gray-400", children: _jsx("span", { children: "\uC544\uC9C1 \uB313\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" }) }), _jsxs("div", { className: "flex items-center justify-around py-3 border-t border-gray-700", children: [_jsxs("button", { className: "flex items-center gap-2 text-gray-400 hover:text-white transition", children: [_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" }) }), _jsx("span", { className: "text-sm", children: selectedPostData.likeCount })] }), _jsxs("button", { className: "flex items-center gap-2 text-gray-400 hover:text-white transition", children: [_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), _jsx("span", { className: "text-sm", children: selectedPostData.commentCount })] }), _jsxs("button", { className: "flex items-center gap-2 text-gray-400 hover:text-white transition", children: [_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" }) }), _jsx("span", { className: "text-sm", children: selectedPostData.shareCount })] })] })] }), _jsxs("div", { className: "mt-4 px-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-white", children: "\uB313\uAE00" }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-xs", children: "\uD83D\uDC64" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "bg-[#2A2B30] rounded-2xl px-4 py-3", children: [_jsx("div", { className: "font-semibold text-sm mb-1 text-white", children: "FitAI \uC0AC\uC6A9\uC7902" }), _jsx("p", { className: "text-sm text-gray-300", children: "\uC88B\uC544\uC694 \uD83D\uDC4D" })] }), _jsxs("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-500", children: [_jsx("span", { children: "2025.03.17 2:47 \uC624\uD6C4" }), _jsx("button", { className: "hover:text-white transition", children: "\uC88B\uC544\uC694 (1)" }), _jsx("button", { className: "hover:text-white transition", children: "\uB2F5\uAE00 \uB2EC\uAE30" })] })] })] }) })] })] }) }), _jsx("div", { className: "bg-[#2A2B30] border-t border-gray-700 p-4", children: _jsxs("div", { className: "max-w-7xl mx-auto flex gap-3 px-8", children: [_jsx("div", { className: "w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-xs", children: "\uD83D\uDC64" }) }), _jsx("input", { type: "text", placeholder: "\uB313\uAE00\uC744 \uC785\uB825\uD558\uC138\uC694...", className: "flex-1 bg-[#1E1F23] text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-orange-500" }), _jsx("button", { className: "text-orange-500 font-semibold px-4 hover:opacity-80 transition", children: "\uAC8C\uC2DC" })] }) })] }))] }));
}
export default Community;
