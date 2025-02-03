import localforage from 'https://cdn.jsdelivr.net/npm/localforage@1.10.0/+esm';

export const initDatabase = async () => {
    await localforage.config({
        name: 'VoPortinaDatabase',
        storeName: 'registrosDiarios'
    });
};

export const saveRegistroDiario = async (registro) => {
    try {
        const registros = await localforage.getItem('registros') || [];
        registros.push(registro);
        await localforage.setItem('registros', registros);
    } catch (error) {
        console.error('Erro ao salvar registro:', error);
    }
};

export const getRegistrosDiarios = async (galpao = 'todos', dataInicial = null, dataFinal = null) => {
    try {
        const registros = await localforage.getItem('registros') || [];
        
        return registros.filter(registro => {
            const matchGalpao = galpao === 'todos' || registro.galpao === galpao;
            const matchDataInicial = !dataInicial || new Date(registro.data) >= dataInicial;
            const matchDataFinal = !dataFinal || new Date(registro.data) <= dataFinal;
            
            return matchGalpao && matchDataInicial && matchDataFinal;
        });
    } catch (error) {
        console.error('Erro ao buscar registros:', error);
        return [];
    }
};

export const updateRegistrosDiarios = async (registroAtualizado) => {
    try {
        const registros = await localforage.getItem('registros') || [];
        const index = registros.findIndex(registro => registro.id === registroAtualizado.id);
        if (index !== -1) {
            registros[index] = registroAtualizado;
            await localforage.setItem('registros', registros);
        }
    } catch (error) {
        console.error('Erro ao atualizar registro:', error);
    }
};