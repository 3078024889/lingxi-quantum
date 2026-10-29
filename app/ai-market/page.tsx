import type {Metadata} from 'next';
import AiMarketSearch from '@/components/ai-market/AiMarketSearch';
import MarketRankings from '@/components/ai-market/MarketRankings';
import LiveHubDiscovery from '@/components/ai-market/LiveHubDiscovery';
export const metadata:Metadata={title:'全球 AI 工具搜索与行情 | LINGXIFIELD',description:'输入实际需求，找到经过来源核验的 AI 工具。价格、免费额度和地区限制缺少证据时明确标注待核实。',robots:{index:false,follow:false}};
export default function Page(){return <><AiMarketSearch/><div style={{maxWidth:1100,margin:'0 auto',padding:'0 18px 80px'}}><MarketRankings/><LiveHubDiscovery/></div></>;}
