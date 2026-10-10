import{test,expect}from"playwright/test";
import{scholarlySearchUrl,parseScholarlyPapers}from"../../lib/sasi/research/openalex-scholarly";
test("scholarly search filters on a bounded real publication window",()=>{
 const url=new URL(scholarlySearchUrl("synthetic biology",60,new Date("2026-10-09T00:00:00.000Z")));
 expect(url.hostname).toBe("api.openalex.org");
 expect(url.searchParams.get("filter")).toBe("from_publication_date:2026-08-10");
 expect(url.searchParams.get("search")).toBe("synthetic biology");
 expect(url.searchParams.get("per_page")).toBe("10");
});
test("scholarly metadata refuses fabricated identifiers and removes duplicate records",()=>{
 const rows=parseScholarlyPapers({results:[
  {id:"https://openalex.org/W123",title:"Verified paper",doi:"https://doi.org/10.1101/test",publication_date:"2026-10-01",authorships:[{author:{display_name:"Researcher"}}],cited_by_count:0},
  {id:"https://openalex.org/W123",title:"Repeat",doi:"https://doi.org/10.1101/test",publication_date:"2026-10-01"},
  {id:"javascript:alert(1)",title:"Unsafe",doi:"javascript:alert(1)"},
  {title:"No identifier"}
 ]});
 expect(rows).toHaveLength(1);
 expect(rows[0].title).toBe("Verified paper");
 expect(rows[0].authors).toEqual(["Researcher"]);
 expect(rows[0].citations).toBe(0);
});
test("empty query cannot issue remote scholarly requests",()=>{
 expect(()=>scholarlySearchUrl("   ",60)).toThrow();
 expect(parseScholarlyPapers({results:[]})).toEqual([]);
});
