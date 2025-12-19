
import React, { useEffect, useState } from 'react';

interface TradingViewChartProps {
  symbol: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
  const [containerId] = useState(`tv_${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const createWidget = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          "width": "100%",
          "height": 380,
          "symbol": symbol.toUpperCase().includes('USDT') || symbol.toUpperCase().includes('USD') ? symbol : `${symbol}`,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "container_id": containerId,
          "backgroundColor": "rgba(0, 0, 0, 1)",
          "gridLineColor": "rgba(42, 46, 57, 0.5)",
        });
      }
    };

    // Small delay to ensure the container is ready in the DOM
    const timeout = setTimeout(createWidget, 100);
    return () => clearTimeout(timeout);
  }, [symbol, containerId]);

  return (
    <div className="w-full mt-4 mb-2 rounded-xl overflow-hidden border border-zinc-800 bg-black shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">Market Live</span>
        </div>
        <span className="text-[11px] font-mono text-white/70">{symbol.toUpperCase()}</span>
      </div>
      <div id={containerId} className="w-full h-[380px]" />
    </div>
  );
};

export default TradingViewChart;
