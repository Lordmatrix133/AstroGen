import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Star, Palette, Calendar, Hash, Lightbulb, ClipboardList, AlertCircle, Lock, Code } from 'lucide-react';
import axios from 'axios';

type SignData = {
  description: string;
  luckyNumber: number;
  color: string;
  date: string;
  advice?: string;
  summary?: string;
};

function App() {
  const [selectedSign, setSelectedSign] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [signData, setSignData] = useState<SignData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastConsultedSign, setLastConsultedSign] = useState<string | null>(null);
  const [hasConsultedToday, setHasConsultedToday] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Endpoint da API - detecta se estamos em ambiente de desenvolvimento ou produção
  const API_ENDPOINT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:9999/api/horoscope'
    : '/api/horoscope';

  const signs = [
    'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
    'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
  ];
  
  // Obter a data atual no fuso horário de Brasília (GMT-3)
  const getBrazilianDate = (): string => {
    const now = new Date();
    // Ajuste para GMT-3 (fuso de Brasília)
    const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // -3 horas em milissegundos
    return brasiliaTime.toISOString().split('T')[0]; // YYYY-MM-DD
  };
  
  // Verificar se já houve consulta hoje
  const checkConsultationStatus = (): boolean => {
    const todayKey = `consulted_today_${getBrazilianDate()}`;
    return localStorage.getItem(todayKey) === 'true';
  };
  
  // Marcar que houve consulta hoje
  const markConsultationDone = (): void => {
    const todayKey = `consulted_today_${getBrazilianDate()}`;
    localStorage.setItem(todayKey, 'true');
    setHasConsultedToday(true);
  };
  
  // Verificar periodicamente se a data mudou para resetar o status de consulta
  useEffect(() => {
    // Carregar status de consulta ao iniciar
    setHasConsultedToday(checkConsultationStatus());
    
    // Configurar verificação periódica
    const checkDateChange = () => {
      const currentDateKey = `last_check_date`;
      const lastCheckDate = localStorage.getItem(currentDateKey) || '';
      const currentDate = getBrazilianDate();
      
      // Se a data mudou, resetar status de consulta
      if (lastCheckDate !== currentDate) {
        localStorage.setItem(currentDateKey, currentDate);
        const newConsultationStatus = checkConsultationStatus();
        setHasConsultedToday(newConsultationStatus);
      }
    };
    
    // Executar imediatamente
    checkDateChange();
    
    // Configurar intervalo de verificação a cada minuto
    const interval = setInterval(checkDateChange, 60000); // 60 segundos
    
    // Limpar intervalo ao desmontar
    return () => clearInterval(interval);
  }, []);

  const consultSign = async () => {
    if (!selectedSign) return;
    
    // Verificar se já houve consulta hoje
    if (hasConsultedToday) {
      setError(`Você já realizou sua consulta diária. Volte amanhã para uma nova previsão!`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Chamando a API de horóscopo
      const response = await axios.post(API_ENDPOINT, { 
        sign: selectedSign,
        use_cache: false
      });
      
      // Salvamos os dados iniciais
      const initialData = response.data;
      setLastConsultedSign(selectedSign);
      
      // Agora fazemos uma segunda chamada para obter o resumo rebelde
      const rebelResponse = await axios.post(API_ENDPOINT, {
        sign: selectedSign,
        use_cache: true
      });
      
      // Utilizamos os dados iniciais, mas com o resumo rebelde
      setSignData(rebelResponse.data);
      setShowModal(true);
      
      // Marcar que já houve consulta hoje
      markConsultationDone();
    } catch (err) {
      setError('Não foi possível consultar o horóscopo. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Função para fechar o modal quando clicar fora dele
  const handleOutsideClick = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowModal(false);
    }
  };

  // Adiciona e remove o event listener para cliques fora do modal
  useEffect(() => {
    if (showModal) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showModal]);

  return (
    <div className="min-h-screen bg-black relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Gradient glow effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-violet-800/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-900/20 rounded-full blur-[90px]" />
      </div>

      <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-2xl relative z-10 border border-white/10">
        <div className="text-center mb-8">
          <img 
            src="https://i.postimg.cc/P52wTV9K/images-removebg-preview.png" 
            alt="Zodiac signs" 
            className="w-32 h-32 object-contain mx-auto mb-6"
          />
          <div className="inline-flex items-center justify-center gap-2 flex-wrap">
            <Sparkles className="w-8 h-8 text-purple-400 shrink-0" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-violet-400">
              Veja seu signo hoje
            </h1>
          </div>
          <p className="text-gray-300 mt-4 text-lg">
            Seu dia tá uma bosta? Acordou com a porra do pé esquerdo ou tá tudo tão perfeito que parece suspeito? 
            saiba o que os astros têm a dizer sobre! 🌟
          </p>
          
          {hasConsultedToday && (
            <div className="mt-4 p-4 bg-amber-900/50 border border-amber-500/50 rounded-lg text-amber-200 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="w-5 h-5" />
                <h3 className="font-semibold">Consulta Bloqueada</h3>
              </div>
              <p>Você já realizou sua consulta diária. Volte amanhã para uma nova previsão!</p>
              {lastConsultedSign && (
                <p className="mt-2 text-sm">Último signo consultado: <span className="font-semibold">{lastConsultedSign}</span></p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <select
            value={selectedSign}
            onChange={(e) => setSelectedSign(e.target.value)}
            className="w-full p-4 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-black/50 text-white backdrop-blur-sm"
            disabled={hasConsultedToday}
          >
            <option value="">Selecione seu signo</option>
            {signs.map((sign) => (
              <option key={sign} value={sign}>
                {sign}
              </option>
            ))}
          </select>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={consultSign}
            disabled={!selectedSign || loading || hasConsultedToday}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold 
                     hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.4)] transition-all"
          >
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
          
          {!hasConsultedToday && (
            <div className="p-2 text-amber-300 text-xs text-center">
              Atenção: Você só pode realizar uma consulta por dia. Escolha seu signo com cuidado!
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 text-gray-500 text-xs text-center flex items-center justify-center gap-1">
          <Code className="w-3.5 h-3.5" />
          <span>Powered by AstroGen | Desenvolvido</span>
        </div>
      </div>

      {showModal && signData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
          <div 
            ref={modalRef}
            className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-2xl relative border border-purple-500/20 my-8 max-h-[90vh] overflow-y-auto modal-content"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <style dangerouslySetInnerHTML={{
              __html: `
                .modal-content::-webkit-scrollbar {
                  display: none;
                }
              `
            }} />
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Horóscopo para {lastConsultedSign}
            </h2>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{signData.date}</span>
              </div>

              <p className="text-gray-100 text-lg leading-relaxed italic border-l-4 border-purple-500 pl-4">
                "{signData.description}"
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center gap-2 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <Hash className="w-5 h-5 text-purple-400" />
                  <span>Número da Sorte: {signData.luckyNumber}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <Palette className="w-5 h-5 text-purple-400" />
                  <span>Cor do Dia: {signData.color}</span>
                </div>
                {signData.advice && (
                  <div className="flex gap-2 items-start mt-6">
                    <Lightbulb className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-medium text-amber-300 mb-2">Conselho:</h3>
                      <p className="text-amber-100">{signData.advice}</p>
                    </div>
                  </div>
                )}
              </div>

              {signData.summary && (
                <div className="mt-6 pt-4 border-t border-purple-500/20">
                  <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Resumindo:
                  </h3>
                  <p className="text-gray-200 italic">
                    {signData.summary}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-purple-500/20 text-gray-400 text-xs flex items-center justify-start gap-1">
                <span>Resposta IA via AstroGen API &lt;/&gt;</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;