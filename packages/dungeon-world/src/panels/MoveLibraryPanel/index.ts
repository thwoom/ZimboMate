import { Panel } from '../../framework/Panel';
import MoveLibraryPanel from './MoveLibraryPanel';

const MoveLibraryPanelInstance: Panel = {
  metadata: {
    id: 'move-library',
    name: 'Move Library',
    icon: '📚',
    description: 'Search and browse all available moves from the Dungeon World rules',
    priority: 5,
  },
  component: MoveLibraryPanel,
};

export default MoveLibraryPanelInstance;



