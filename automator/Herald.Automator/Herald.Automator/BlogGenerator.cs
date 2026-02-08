using GenerativeAI;
using System;
using System.Collections.Generic;
using System.Text;

namespace Herald.Automator
{
    public class BlogGenerator(IConfiguration configuration)
    {
        private readonly string _apiKey =
            configuration["GEMINI_API_KEY"]
            ?? configuration["BlogSettings:GeminiApiKey"]
            ?? throw new ArgumentNullException("Gemini API Key가 설정되지 않았습니다.");

        public async Task<BlogPostResult> GeneratePostAsync()
        {
            var client = new GenerativeModel(_apiKey, "gemini-3-flash-preview");

            // 기존 블로그 스타일을 유지하기 위한 프롬프트 구성
            string prompt = """
            IT 기술 블로그 포스트를 MDX 형식으로 작성해주세요. 
            주제는 최신 IT 트렌드, 프로그래밍, 또는 소프트웨어 아키텍처 중 하나로 선정해주세요.
            
            출력 형식:
            ---
            title: "제목"
            excerpt: "한 줄 요약"
            description: "상세 설명"
            date: "YYYY-MM-DD" (오늘 날짜로 설정)
            readTime: "10 min"
            tags: ["태그1", "태그2"]
            category: "AI" (프로그래밍, AI, 클라우드, 데이터베이스, 보안 등등)
            accent: "aqua" (ember, aqua, lime, sand, rose 중 선택)
            ---
            # 본문 내용...
            """;

            var response = await client.GenerateContentAsync(prompt);
            var content = response.Text;

            // 날짜를 기반으로 slug 생성
            string slug = $"auto-{DateTime.Now:yyyy-MM-dd}";

            return new BlogPostResult(slug, content);
        }
    }

    public sealed record BlogPostResult(string Slug, string Content);
}