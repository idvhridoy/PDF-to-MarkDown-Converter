/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Header from './components/Header';
import DropzoneArea from './components/DropzoneArea';
import DualPaneEditor from './components/DualPaneEditor';
import ArchitectureModal from './components/ArchitectureModal';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Toaster position="bottom-right" richColors />
      <Header />
      <main className="flex-1 flex flex-col">
        <DropzoneArea />
        <DualPaneEditor />
      </main>
      <ArchitectureModal />
    </div>
  );
}
