import Home from './market-workbench';
import {searchPlatforms} from '../lib/platform-repository';
export default function Page(){return <Home initialPlatforms={searchPlatforms({limit:24}).items}/>;}
