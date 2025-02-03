import { initDatabase, saveRegistroDiario, getRegistrosDiarios } from './database.js';

document.addEventListener('DOMContentLoaded', () => {
    const tipoRelatorioSelect = document.getElementById('tipo-relatorio');
    const galpaoRelatorioSelect = document.getElementById('galpao-relatorio');
    const periodoRelatorioSelect = document.getElementById('periodo-relatorio');
    const dataInicialInput = document.getElementById('data-inicial');
    const dataFinalInput = document.getElementById('data-final');
    const gerarRelatorioBtn = document.getElementById('gerar-relatorio');
    const exportarRelatorioBtn = document.getElementById('exportar-relatorio');
    const tabelaRelatorios = document.getElementById('tabela-relatorios');

    let charts = {};

    const initCharts = () => {
        const chartConfigs = {
            'grafico-ração': { 
                type: 'bar', 
                data: { labels: [], datasets: [{ label: 'Ração (kg)', data: [] }] },
                options: { responsive: true, title: { display: true, text: 'Consumo de Ração' } }
            },
            'grafico-ovos': { 
                type: 'line', 
                data: { labels: [], datasets: [{ label: 'Ovos Colhidos', data: [] }] },
                options: { responsive: true, title: { display: true, text: 'Ovos Colhidos' } }
            },
            'grafico-galinhas-mortas': { 
                type: 'pie', 
                data: { labels: ['Galpão 1', 'Galpão 2', 'Galpão 3', 'Galpão 4'], datasets: [{ data: [] }] },
                options: { responsive: true, title: { display: true, text: 'Galinhas Mortas por Galpão' } }
            }
        };

        Object.keys(chartConfigs).forEach(chartId => {
            const ctx = document.getElementById(chartId).getContext('2d');
            charts[chartId] = new Chart(ctx, chartConfigs[chartId]);
        });
    };

    const updateCharts = (data) => {
        // Lógica para atualizar os gráficos com base nos dados
        const racaoData = data.map(item => item.racao.reduce((sum, r) => sum + parseFloat(r.quantidade), 0));
        const ovosData = data.map(item => parseInt(item.ovosColhidos));
        const galinhasMortasData = [
            data.filter(item => item.galpao === '1').reduce((sum, item) => sum + parseInt(item.galinhasMortas), 0),
            data.filter(item => item.galpao === '2').reduce((sum, item) => sum + parseInt(item.galinhasMortas), 0),
            data.filter(item => item.galpao === '3').reduce((sum, item) => sum + parseInt(item.galinhasMortas), 0),
            data.filter(item => item.galpao === '4').reduce((sum, item) => sum + parseInt(item.galinhasMortas), 0)
        ];

        charts['grafico-ração'].data.labels = data.map(item => item.data);
        charts['grafico-ração'].data.datasets[0].data = racaoData;
        charts['grafico-ovos'].data.labels = data.map(item => item.data);
        charts['grafico-ovos'].data.datasets[0].data = ovosData;
        charts['grafico-galinhas-mortas'].data.datasets[0].data = galinhasMortasData;

        Object.values(charts).forEach(chart => chart.update());
    };

    const gerarRelatorio = async () => {
        const tipoRelatorio = tipoRelatorioSelect.value;
        const galpao = galpaoRelatorioSelect.value;
        const periodo = periodoRelatorioSelect.value;
        const dataInicial = new Date(dataInicialInput.value);
        const dataFinal = new Date(dataFinalInput.value);

        try {
            let relatorios = [];

            switch (tipoRelatorio) {
                case 'registro-diario':
                    relatorios = await getRegistrosDiarios(galpao, dataInicial, dataFinal);
                    updateCharts(relatorios);
                    preencherTabelaRelatorio(relatorios);
                    break;
                // Implementar outros tipos de relatórios...
            }
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
        }
    };

    const preencherTabelaRelatorio = (dados) => {
        tabelaRelatorios.innerHTML = '';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Galpão', 'Data', 'Ração', 'Ovos Colhidos', 'Galinhas Mortas', 'Observações'];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        tabelaRelatorios.appendChild(thead);

        const tbody = document.createElement('tbody');
        dados.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.galpao}</td>
                <td>${item.data}</td>
                <td>${item.racao.map(r => `${r.tipo}: ${r.quantidade}kg`).join(', ')}</td>
                <td>${item.ovosColhidos}</td>
                <td>${item.galinhasMortas}</td>
                <td>${item.observacoes}</td>
            `;
            tbody.appendChild(tr);
        });

        tabelaRelatorios.appendChild(tbody);
    };

    const exportarRelatorio = () => {
        const wb = XLSX.utils.table_to_book(tabelaRelatorios);
        XLSX.writeFile(wb, `relatorio_${tipoRelatorioSelect.value}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    gerarRelatorioBtn.addEventListener('click', gerarRelatorio);
    exportarRelatorioBtn.addEventListener('click', exportarRelatorio);

    // Inicializar gráficos
    initCharts();

    // Inicializar banco de dados
    initDatabase();
});