/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { CATEGORIES, CATEGORY_PRIORITY } from './constants';

export default function App() {
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({
    A: [], B: [], C: [], D: [], E: []
  });
  const [view, setView] = useState<'checklist' | 'tiebreak' | 'result'>('checklist');
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [tiedCategoryIds, setTiedCategoryIds] = useState<string[]>([]);
  const [manualWinnerId, setManualWinnerId] = useState<string | null>(null);

  const toggleChecklistItem = (catId: string, item: string) => {
    setSelectedItems(prev => {
      const items = prev[catId].includes(item)
        ? prev[catId].filter(i => i !== item)
        : [...prev[catId], item];
      return { ...prev, [catId]: items };
    });
  };

  const handleIdentifyBottleneck = () => {
    const counts = (Object.entries(selectedItems) as [string, string[]][]).map(([id, items]) => ({
      id,
      count: items.length
    }));
    
    const maxCount = Math.max(...counts.map(c => c.count));
    
    if (maxCount === 0) {
      setManualWinnerId('B');
      setView('result');
      return;
    }

    const tiedIds = counts.filter(c => c.count === maxCount).map(c => c.id);

    if (tiedIds.length > 1) {
      setTiedCategoryIds(tiedIds);
      setView('tiebreak');
    } else {
      setManualWinnerId(tiedIds[0]);
      setView('result');
    }
  };

  const winningCategory = useMemo(() => {
    if (manualWinnerId) return CATEGORIES[manualWinnerId];
    
    // Safety fallback (though handleIdentifyBottleneck should set manualWinnerId)
    const counts = (Object.entries(selectedItems) as [string, string[]][]).map(([id, items]) => ({
      id,
      count: items.length
    }));

    if (counts.every(c => c.count === 0)) return CATEGORIES['B'];

    let maxCount = -1;
    let winnerId = 'B';

    for (const id of CATEGORY_PRIORITY) {
      const catCount = selectedItems[id].length;
      if (catCount > maxCount) {
        maxCount = catCount;
        winnerId = id;
      }
    }

    return CATEGORIES[winnerId];
  }, [selectedItems, manualWinnerId]);

  const reset = () => {
    setSelectedItems({ A: [], B: [], C: [], D: [], E: [] });
    setSelectedCandidateId(null);
    setTiedCategoryIds([]);
    setManualWinnerId(null);
    setView('checklist');
  };

  return (
    <div className="min-h-screen bg-warm-bg text-text-main flex flex-col font-sans selection:bg-soft-olive/50">
      {/* Header */}
      <header className="px-6 py-8 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-olive tracking-[0.1em] uppercase leading-none">
            Pull-Up BodyMethod
          </h1>
          <p className="text-sm text-text-muted mt-2 serif italic">
            新規課題発見ツール（診断シート）
          </p>
        </div>
        <div className="bg-soft-olive px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider text-olive shadow-sm uppercase">
          Course 3-1: Bottleneck Discovery
        </div>
      </header>

      <main className="flex-1 px-4 md:px-12 max-w-5xl mx-auto w-full pb-20">
        <AnimatePresence mode="wait">
          {view === 'checklist' ? (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Intro Card */}
              <div className="bg-surface p-8 rounded-[32px] border border-warm-border shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-olive mb-4 serif leading-tight">
                    今のあなたの成長を止めている<br className="hidden md:block" />「最大のボトルネック」を見つけよう！
                  </h2>
                  <p className="text-text-muted leading-relaxed text-sm md:text-base">
                    最近の自分に当てはまる項目をすべてチェックしてください。<br />
                    最もチェックが多かったカテゴリーが、あなたの現在のボトルネックです。
                  </p>
                </div>
                <div className="w-24 h-24 bg-soft-olive/30 rounded-full flex items-center justify-center text-olive shrink-0">
                  <ClipboardList className="w-12 h-12" />
                </div>
              </div>

              {/* Checklist Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(Object.entries(CATEGORIES) as [string, typeof CATEGORIES[string]][]).map(([id, cat]) => (
                  <div key={id} className="bg-surface p-6 rounded-[24px] border border-warm-border shadow-sm space-y-4">
                    <h3 className="font-bold text-olive flex items-center gap-2 text-sm uppercase tracking-widest border-l-4 border-olive pl-3">
                      【{id}】{cat.name}
                      <span className="ml-auto bg-warm-bg px-2 py-0.5 rounded text-[10px] tabular-nums text-text-muted">
                        {selectedItems[id].length} / {cat.checklist.length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {cat.checklist.map((item, idx) => {
                        const isSelected = selectedItems[id].includes(item);
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleChecklistItem(id, item)}
                            className={`w-full flex items-start gap-3 p-3 text-left rounded-xl border transition-all text-xs group ${
                              isSelected 
                                ? 'bg-soft-olive/40 border-olive/50 ring-1 ring-olive/10' 
                                : 'bg-white border-warm-border hover:border-olive/30'
                            }`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-olive border-olive text-white' : 'border-warm-border bg-warm-bg'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span className={isSelected ? 'text-text-main font-medium' : 'text-text-muted'}>
                              {item}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <button
                  onClick={handleIdentifyBottleneck}
                  className="group relative px-12 py-5 bg-olive text-white rounded-full font-bold shadow-2xl shadow-olive/30 hover:scale-[1.02] transition-transform flex items-center gap-3 text-lg"
                >
                  ボトルネックを特定する
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ) : view === 'tiebreak' ? (
            <motion.div
              key="tiebreak"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8 py-10"
            >
              <div className="bg-surface p-10 rounded-[40px] border border-warm-border shadow-xl text-center space-y-6">
                <div className="w-20 h-20 bg-soft-olive/30 rounded-full flex items-center justify-center text-olive mx-auto mb-4">
                  <Target className="w-10 h-10" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-olive serif">
                  直感で選んでみましょう！
                </h2>
                <p className="text-text-muted leading-relaxed">
                  いくつかのカテゴリーでチェックが同数になりました。<br />
                  今のあなたにとって、より大きな課題だと直感的に感じるのはどれですか？
                </p>
                <div className="grid gap-4 pt-4">
                  {tiedCategoryIds.map(id => (
                    <button
                      key={id}
                      onClick={() => {
                        setManualWinnerId(id);
                        setView('result');
                      }}
                      className="group flex items-center justify-between p-6 bg-white border border-warm-border rounded-2xl hover:border-olive hover:shadow-lg transition-all text-left"
                    >
                      <span className="font-bold text-lg text-text-main">
                        【{id}】{CATEGORIES[id].name}
                      </span>
                      <ChevronRight className="w-6 h-6 text-warm-border group-hover:text-olive transition-colors" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setView('checklist')}
                  className="text-xs text-text-muted hover:text-olive underline underline-offset-4 pt-4"
                >
                  チェック内容を修正する
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Result Summary Sidebar */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                <div className="bg-surface p-8 rounded-[32px] border border-warm-border shadow-sm">
                  <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6">
                    診断結果サマリー
                  </h3>
                  <div className="space-y-4">
                    {(Object.entries(selectedItems) as [string, string[]][]).map(([id, items]) => (
                      <div key={id} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-end text-xs">
                          <span className={`${winningCategory.id === id ? 'text-olive font-bold' : 'text-text-muted'}`}>
                            【{id}】{CATEGORIES[id].name}
                          </span>
                          <span className="tabular-nums font-bold">{items.length}個</span>
                        </div>
                        <div className="h-1 bg-warm-bg rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(items.length / CATEGORIES[id].checklist.length) * 100}%` }}
                            className={`h-full ${winningCategory.id === id ? 'bg-olive' : 'bg-warm-border'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 bg-soft-olive/20 rounded-2xl text-[11px] leading-relaxed italic text-olive border border-soft-olive/50">
                    💡 「{winningCategory.id}: {winningCategory.name}」が今のあなたにとって改善の伸び代（宝の地図）です。
                  </div>
                  <button
                    onClick={reset}
                    className="mt-6 w-full py-3 rounded-full border border-warm-border text-xs font-bold text-text-muted hover:bg-warm-bg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> 最初からやり直す
                  </button>
                </div>
              </div>

              {/* Main Result Detail */}
              <div className="lg:col-span-8 bg-surface p-8 md:p-12 rounded-[40px] border-2 border-olive shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
                  <Target className="w-64 h-64" />
                </div>

                <div className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-olive serif leading-tight">
                    診断お疲れ様でした！<br />
                    「ここを直せばもっと進化できる」<br />
                    まさに新規課題の抽出ができましたね！
                  </h2>
                </div>

                {/* Bottleneck Description */}
                <div className="bg-warm-bg p-8 rounded-[24px] border border-warm-border mb-12">
                  <span className="inline-block text-sm font-black text-text-highlight uppercase tracking-[0.2em] mb-3">
                    💡 今のボトルネック: {winningCategory.name}
                  </span>
                  <p className="text-lg md:text-xl leading-relaxed text-text-main serif">
                    {winningCategory.bottleneck}
                  </p>
                </div>

                {/* Candidate Selection */}
                <div className="space-y-6">
                  <span className="block text-base font-black text-text-highlight tracking-tight">
                    あなたの課題候補（一番当てはまるものを参考にしてみてください）
                  </span>
                  <div className="grid gap-4">
                    {winningCategory.candidates.map((candidate) => (
                      <button
                        key={candidate.id}
                        onClick={() => setSelectedCandidateId(candidate.id)}
                        className={`flex items-start gap-5 p-5 rounded-[20px] border text-left transition-all relative group ${
                          selectedCandidateId === candidate.id
                            ? 'border-olive bg-soft-olive/30 shadow-lg ring-1 ring-olive/20'
                            : 'border-warm-border bg-white hover:border-olive/50'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                          selectedCandidateId === candidate.id ? 'bg-olive text-white' : 'bg-warm-bg text-text-muted group-hover:bg-soft-olive/20'
                        }`}>
                          {candidate.id}
                        </span>
                        <span className={`text-sm md:text-base leading-relaxed ${selectedCandidateId === candidate.id ? 'text-text-main font-bold' : 'text-text-muted'}`}>
                          {candidate.text}
                        </span>
                        {selectedCandidateId === candidate.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 bg-olive text-white p-1 rounded-full shadow-lg">
                            <CheckCircle2 className="w-5 h-5" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-12 pt-10 border-t border-dashed border-warm-border text-center">
                  <p className="text-base text-text-muted leading-relaxed italic font-medium">
                    このツールの回答は、あくまでも目安になります。<br />
                    一番の課題を特定するための参考にしてください。
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto px-6 py-10 text-center border-t border-warm-border bg-surface/30">
        <p className="text-[10px] text-text-muted/40 uppercase tracking-[0.3em] font-serif">
          &copy; {new Date().getFullYear()} PULL-UP BODYMETHOD
        </p>
      </footer>
    </div>
  );
}
