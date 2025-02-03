document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.sidebar .menu li');
  
  // Menu Navigation
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      menuItems.forEach(el => el.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Hide all page sections
      const pageSections = document.querySelectorAll('.page-section');
      pageSections.forEach(section => section.style.display = 'none');
      
      // Show selected page section
      const page = item.dataset.page;
      const pageTitle = document.getElementById('page-title');
      pageTitle.textContent = item.textContent.trim();
      
      const selectedSection = document.getElementById(page);
      if (selectedSection) {
        selectedSection.style.display = 'block';
      }
    });
  });

  // Registro Diário functionality
  const registroDiarioPage = document.getElementById('registro-diario');
  if (registroDiarioPage) {
    const galpaoButtons = document.querySelectorAll('.galpao-btn');
    const quantidadeRacaoContainer = document.getElementById('quantidade-racao-container');
    const racaoCheckboxes = document.querySelectorAll('input[name="racao"]');
    const registroForm = document.getElementById('registro-form');

    // Galpão selection
    galpaoButtons.forEach(button => {
      button.addEventListener('click', () => {
        galpaoButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });

    // Dynamic ração quantity inputs
    racaoCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        updateRacaoQuantityInputs();
      });
    });

    function updateRacaoQuantityInputs() {
      quantidadeRacaoContainer.innerHTML = '';
      racaoCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
          const racaoQuantidadeDiv = document.createElement('div');
          racaoQuantidadeDiv.classList.add('racao-quantidade');
          racaoQuantidadeDiv.innerHTML = `
            <label>${checkbox.value}:</label>
            <input type="number" name="quantidade-${checkbox.value}" step="0.1" min="0" placeholder="kg">
          `;
          quantidadeRacaoContainer.appendChild(racaoQuantidadeDiv);
        }
      });
    }

    // Form submission
    registroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const galpao = document.querySelector('.galpao-btn.active').dataset.galpao;
      const data = document.getElementById('data-registro').value;
      const ovosColhidos = document.getElementById('ovos-colhidos').value;
      const galinhasMortas = document.getElementById('galinhas-mortas').value;
      const observacoes = document.getElementById('observacoes').value;

      const racaoData = [];
      document.querySelectorAll('.racao-quantidade input').forEach(input => {
        if (input.value) {
          racaoData.push({
            tipo: input.name.split('-')[1],
            quantidade: input.value
          });
        }
      });

      const registroData = {
        galpao,
        data,
        racao: racaoData,
        ovosColhidos,
        galinhasMortas,
        observacoes
      };

      console.log('Registro Diário:', registroData);
      // TODO: Implement actual data submission logic
      alert('Registro salvo com sucesso!');
    });
  }

  // Pedidos Management
  const pedidosPage = document.getElementById('pedidos');
  const adicionarPedidoForm = document.getElementById('adicionar-pedido-form');
  const pedidosTbody = document.getElementById('pedidos-tbody');

  // Load existing pedidos from localStorage
  let pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
  renderPedidos();

  adicionarPedidoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dataEntrega = document.getElementById('data-entrega').value;
    const nomeCliente = document.getElementById('nome-cliente').value;
    const quantidadeOvos = document.getElementById('quantidade-ovos').value;

    // Add new pedido
    pedidos.push({
      id: Date.now(), // unique identifier
      dataEntrega,
      nomeCliente,
      quantidadeOvos: parseInt(quantidadeOvos),
      separado: false
    });

    // Save to localStorage
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    // Render pedidos
    renderPedidos();

    // Reset form
    adicionarPedidoForm.reset();
  });

  function renderPedidos() {
    pedidosTbody.innerHTML = '';
    pedidos.forEach((pedido, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(pedido.dataEntrega).toLocaleDateString()}</td>
        <td>${pedido.nomeCliente}</td>
        <td>${pedido.quantidadeOvos}</td>
        <td>
          <span class="status-pedido ${pedido.separado ? 'separado' : 'pendente'}">
            ${pedido.separado ? 'Separado' : 'Pendente'}
          </span>
        </td>
        <td>
          <button class="btn-toggle-status" data-id="${pedido.id}">
            ${pedido.separado ? 'Marcar como Pendente' : 'Marcar como Separado'}
          </button>
          <button class="btn-excluir" data-id="${pedido.id}">Excluir</button>
        </td>
      `;
      pedidosTbody.appendChild(tr);
    });

    // Add event listeners to toggle status and delete buttons
    document.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const pedidoIndex = pedidos.findIndex(p => p.id == id);
        if (pedidoIndex !== -1) {
          pedidos[pedidoIndex].separado = !pedidos[pedidoIndex].separado;
          localStorage.setItem('pedidos', JSON.stringify(pedidos));
          renderPedidos();
        }
      });
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        pedidos = pedidos.filter(p => p.id != id);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        renderPedidos();
      });
    });
  }

  // Funcionários Management
  const funcionariosPage = document.getElementById('funcionarios');
  const pageTitle = document.getElementById('page-title');
  const pageSections = document.querySelectorAll('.page-section');

  // Funcionários Form Handling
  const adicionarFuncionarioForm = document.getElementById('adicionar-funcionario-form');
  const funcionariosTbody = document.getElementById('funcionarios-tbody');

  // Load existing funcionários from localStorage
  let funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
  renderFuncionarios();

  adicionarFuncionarioForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nomeFuncionario = document.getElementById('nome-funcionario').value;
    const senhaFuncionario = document.getElementById('senha-funcionario').value;

    // Validate senha (only numbers)
    if (!/^\d+$/.test(senhaFuncionario)) {
      alert('A senha deve conter apenas números.');
      return;
    }

    // Check if funcionário already exists
    if (funcionarios.some(f => f.nome === nomeFuncionario)) {
      alert('Funcionário com este nome já existe.');
      return;
    }

    // Add new funcionário
    funcionarios.push({
      nome: nomeFuncionario,
      senha: senhaFuncionario
    });

    // Save to localStorage
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));

    // Render funcionários
    renderFuncionarios();

    // Reset form
    adicionarFuncionarioForm.reset();
  });

  function renderFuncionarios() {
    funcionariosTbody.innerHTML = '';
    funcionarios.forEach((funcionario, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${funcionario.nome}</td>
        <td>
          <button class="btn-excluir" data-index="${index}">Excluir</button>
        </td>
      `;
      funcionariosTbody.appendChild(tr);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.dataset.index;
        funcionarios.splice(index, 1);
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        renderFuncionarios();
      });
    });
  }

  // Venda de Ovos Management
  const vendaOvosPage = document.getElementById('venda-ovos');
  const adicionarVendaOvosForm = document.getElementById('adicionar-venda-ovos-form');
  const vendasOvosTbody = document.getElementById('vendas-ovos-tbody');
  const dataBoletoOvosContainer = document.getElementById('data-boleto-container');

  // Payment method toggle for boleto
  const formaPagamentoOvosRadios = document.querySelectorAll('input[name="forma-pagamento"]');

  formaPagamentoOvosRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      dataBoletoOvosContainer.style.display = radio.value === 'boleto' ? 'block' : 'none';
    });
  });

  // Calculate total value dynamically
  const quantidadeOvosVenda = document.getElementById('quantidade-ovos-venda');
  const valorUnidade = document.getElementById('valor-unidade');
  const valorTotal = document.getElementById('valor-total');

  quantidadeOvosVenda.addEventListener('input', calcularValorTotal);
  valorUnidade.addEventListener('input', calcularValorTotal);

  function calcularValorTotal() {
    const quantidade = quantidadeOvosVenda.value || 0;
    const valor = valorUnidade.value || 0;
    valorTotal.value = (quantidade * valor).toFixed(2);
  }

  adicionarVendaOvosForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dataVenda = document.getElementById('data-venda').value;
    const localVenda = document.getElementById('local-venda').value;
    const quantidadeOvos = parseInt(document.getElementById('quantidade-ovos-venda').value);
    const valorUnidadeOvo = parseFloat(document.getElementById('valor-unidade').value);
    const valorTotalVenda = parseFloat(document.getElementById('valor-total').value);
    const formaPagamento = document.querySelector('input[name="forma-pagamento"]:checked').value;
    const dataBoleto = formaPagamento === 'boleto' 
        ? document.getElementById('data-boleto').value 
        : null;

    // Add new venda
    let vendasOvos = JSON.parse(localStorage.getItem('vendasOvos') || '[]');
    vendasOvos.push({
      id: Date.now(), // unique identifier
      dataVenda,
      localVenda,
      quantidadeOvos,
      valorUnidadeOvo,
      valorTotalVenda,
      formaPagamento,
      dataBoleto
    });

    // Save to localStorage
    localStorage.setItem('vendasOvos', JSON.stringify(vendasOvos));

    // Render vendas
    renderVendasOvos();

    // Reset form
    adicionarVendaOvosForm.reset();
    dataBoletoOvosContainer.style.display = 'none';
  });

  function renderVendasOvos() {
    vendasOvosTbody.innerHTML = '';
    let vendasOvos = JSON.parse(localStorage.getItem('vendasOvos') || '[]');
    vendasOvos.forEach((venda, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(venda.dataVenda).toLocaleDateString()}</td>
        <td>${venda.localVenda}</td>
        <td>${venda.quantidadeOvos}</td>
        <td>R$ ${venda.valorTotalVenda.toFixed(2)}</td>
        <td>${venda.formaPagamento === 'boleto' 
            ? `Boleto (${new Date(venda.dataBoleto).toLocaleDateString()})` 
            : venda.formaPagamento.replace('-', ' ')}</td>
      `;
      vendasOvosTbody.appendChild(tr);
    });
  }

  // Venda de Ração Management
  const vendaRacaoPage = document.getElementById('venda-racao');
  const adicionarVendaRacaoForm = document.getElementById('adicionar-venda-racao-form');
  const vendasRacaoTbody = document.getElementById('vendas-racao-tbody');
  const dataBoletoRacaoContainer = document.getElementById('data-boleto-racao-container');

  // Payment method toggle for boleto
  const formaPagamentoRacaoRadios = document.querySelectorAll('input[name="forma-pagamento-racao"]');

  formaPagamentoRacaoRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      dataBoletoRacaoContainer.style.display = radio.value === 'boleto' ? 'block' : 'none';
    });
  });

  // Calculate total value dynamically
  const quantidadeRacaoVenda = document.getElementById('quantidade-racao-venda');
  const valorRacaoUnidade = document.getElementById('valor-racao-unidade');
  const valorTotalRacao = document.getElementById('valor-total-racao');

  quantidadeRacaoVenda.addEventListener('input', calcularValorTotalRacao);
  valorRacaoUnidade.addEventListener('input', calcularValorTotalRacao);

  function calcularValorTotalRacao() {
    const quantidade = quantidadeRacaoVenda.value || 0;
    const valor = valorRacaoUnidade.value || 0;
    valorTotalRacao.value = (quantidade * valor).toFixed(2);
  }

  adicionarVendaRacaoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dataVenda = document.getElementById('data-venda-racao').value;
    const localVenda = document.getElementById('local-venda-racao').value;
    const tipoRacao = document.getElementById('tipo-racao').value;
    const quantidadeRacao = parseFloat(document.getElementById('quantidade-racao-venda').value);
    const valorUnidadeRacao = parseFloat(document.getElementById('valor-racao-unidade').value);
    const valorTotalVendaRacao = parseFloat(document.getElementById('valor-total-racao').value);
    const formaPagamento = document.querySelector('input[name="forma-pagamento-racao"]:checked').value;
    const dataBoleto = formaPagamento === 'boleto' 
        ? document.getElementById('data-boleto-racao').value 
        : null;

    // Add new venda de ração
    let vendasRacao = JSON.parse(localStorage.getItem('vendasRacao') || '[]');
    vendasRacao.push({
      id: Date.now(), // unique identifier
      dataVenda,
      localVenda,
      tipoRacao,
      quantidadeRacao,
      valorUnidadeRacao,
      valorTotalVendaRacao,
      formaPagamento,
      dataBoleto
    });

    // Save to localStorage
    localStorage.setItem('vendasRacao', JSON.stringify(vendasRacao));

    // Render vendas
    renderVendasRacao();

    // Reset form
    adicionarVendaRacaoForm.reset();
    dataBoletoRacaoContainer.style.display = 'none';
  });

  function renderVendasRacao() {
    vendasRacaoTbody.innerHTML = '';
    let vendasRacao = JSON.parse(localStorage.getItem('vendasRacao') || '[]');
    vendasRacao.forEach((venda) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(venda.dataVenda).toLocaleDateString()}</td>
        <td>${venda.localVenda}</td>
        <td>${venda.tipoRacao}</td>
        <td>${venda.quantidadeRacao} kg</td>
        <td>R$ ${venda.valorTotalVendaRacao.toFixed(2)}</td>
        <td>${venda.formaPagamento === 'boleto' 
            ? `Boleto (${new Date(venda.dataBoleto).toLocaleDateString()})` 
            : venda.formaPagamento.replace('-', ' ')}</td>
      `;
      vendasRacaoTbody.appendChild(tr);
    });
  }

  // Ovos Comprados Management
  const ovosCompradosPage = document.getElementById('ovos-comprados');
  const adicionarOvosCompradosForm = document.getElementById('adicionar-ovos-comprados-form');
  const ovosCompradosTbody = document.getElementById('ovos-comprados-tbody');

  // Load existing ovos comprados from localStorage
  let ovosComprados = JSON.parse(localStorage.getItem('ovosComprados') || '[]');
  renderOvosComprados();

  // Calculate total value dynamically
  const quantidadeOvosComprados = document.getElementById('quantidade-ovos-comprados');
  const valorUnidadeOvoComprado = document.getElementById('valor-unidade-ovo-comprado');
  const valorTotalOvosComprados = document.getElementById('valor-total-ovos-comprados');

  quantidadeOvosComprados.addEventListener('input', calcularValorTotalOvosComprados);
  valorUnidadeOvoComprado.addEventListener('input', calcularValorTotalOvosComprados);

  function calcularValorTotalOvosComprados() {
    const quantidade = quantidadeOvosComprados.value || 0;
    const valor = valorUnidadeOvoComprado.value || 0;
    valorTotalOvosComprados.value = (quantidade * valor).toFixed(2);
  }

  adicionarOvosCompradosForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dataCompra = document.getElementById('data-compra-ovos').value;
    const nomeFornecedor = document.getElementById('nome-fornecedor').value;
    const quantidadeOvos = parseInt(document.getElementById('quantidade-ovos-comprados').value);
    const valorUnidadeOvo = parseFloat(document.getElementById('valor-unidade-ovo-comprado').value);
    const valorTotalCompra = parseFloat(document.getElementById('valor-total-ovos-comprados').value);

    // Add new compra de ovos
    ovosComprados.push({
      id: Date.now(), // unique identifier
      dataCompra,
      nomeFornecedor,
      quantidadeOvos,
      valorUnidadeOvo,
      valorTotalCompra
    });

    // Save to localStorage
    localStorage.setItem('ovosComprados', JSON.stringify(ovosComprados));

    // Render ovos comprados
    renderOvosComprados();

    // Reset form
    adicionarOvosCompradosForm.reset();
  });

  function renderOvosComprados() {
    ovosCompradosTbody.innerHTML = '';
    ovosComprados.forEach((compra) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(compra.dataCompra).toLocaleDateString()}</td>
        <td>${compra.nomeFornecedor}</td>
        <td>${compra.quantidadeOvos}</td>
        <td>R$ ${compra.valorTotalCompra.toFixed(2)}</td>
      `;
      ovosCompradosTbody.appendChild(tr);
    });
  }

  // Despesas Management
  const despesasPage = document.getElementById('despesas');
  const adicionarDespesaForm = document.getElementById('adicionar-despesa-form');
  const despesasTbody = document.getElementById('despesas-tbody');
  const dataBoletoDepesasContainer = document.getElementById('data-boleto-despesa-container');

  // Payment method toggle for boleto
  const formaPagamentoDespesaRadios = document.querySelectorAll('input[name="forma-pagamento-despesa"]');

  formaPagamentoDespesaRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      dataBoletoDepesasContainer.style.display = radio.value === 'boleto' ? 'block' : 'none';
    });
  });

  // Calculate total value dynamically
  const quantidadeDespesa = document.getElementById('quantidade-despesa');
  const valorUnidadeDespesa = document.getElementById('valor-unidade-despesa');
  const valorTotalDespesa = document.getElementById('valor-total-despesa');

  quantidadeDespesa.addEventListener('input', calcularValorTotalDespesa);
  valorUnidadeDespesa.addEventListener('input', calcularValorTotalDespesa);

  function calcularValorTotalDespesa() {
    const quantidade = quantidadeDespesa.value || 0;
    const valor = valorUnidadeDespesa.value || 0;
    valorTotalDespesa.value = (quantidade * valor).toFixed(2);
  }

  adicionarDespesaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dataDespesa = document.getElementById('data-despesa').value;
    const produtoDespesa = document.getElementById('produto-despesa').value;
    const quantidadeDespesa = parseFloat(document.getElementById('quantidade-despesa').value);
    const valorUnidadeDespesa = parseFloat(document.getElementById('valor-unidade-despesa').value);
    const valorTotalDespesa = parseFloat(document.getElementById('valor-total-despesa').value);
    const formaPagamento = document.querySelector('input[name="forma-pagamento-despesa"]:checked').value;
    const dataBoleto = formaPagamento === 'boleto' 
        ? document.getElementById('data-boleto-despesa').value 
        : null;

    // Add new despesa
    let despesas = JSON.parse(localStorage.getItem('despesas') || '[]');
    despesas.push({
      id: Date.now(), // unique identifier
      dataDespesa,
      produtoDespesa,
      quantidadeDespesa,
      valorUnidadeDespesa,
      valorTotalDespesa,
      formaPagamento,
      dataBoleto
    });

    // Save to localStorage
    localStorage.setItem('despesas', JSON.stringify(despesas));

    // Render despesas
    renderDespesas();

    // Reset form
    adicionarDespesaForm.reset();
    dataBoletoDepesasContainer.style.display = 'none';
  });

  function renderDespesas() {
    despesasTbody.innerHTML = '';
    let despesas = JSON.parse(localStorage.getItem('despesas') || '[]');
    despesas.forEach((despesa) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(despesa.dataDespesa).toLocaleDateString()}</td>
        <td>${despesa.produtoDespesa}</td>
        <td>${despesa.quantidadeDespesa}</td>
        <td>R$ ${despesa.valorTotalDespesa.toFixed(2)}</td>
        <td>${despesa.formaPagamento === 'boleto' 
            ? `Boleto (${new Date(despesa.dataBoleto).toLocaleDateString()})` 
            : despesa.formaPagamento.replace('-', ' ')}</td>
      `;
      despesasTbody.appendChild(tr);
    });
  }

  // Estoque Management
  const estoquePage = document.getElementById('estoque');
  const adicionarEstoqueRacaoForm = document.getElementById('adicionar-estoque-racao-form');
  const estoqueRacaoTbody = document.getElementById('estoque-racao-tbody');
  const adicionarEstoqueOvosForm = document.getElementById('adicionar-estoque-ovos-form');
  const estoqueOvosTotal = document.getElementById('estoque-ovos-total');

  // Initialize localStorage for stock if not exists
  const initStock = () => {
    if (!localStorage.getItem('estoqueRacao')) {
      const defaultStock = [
        { tipo: 'Crescimento', quantidade: 0 },
        { tipo: 'Pico', quantidade: 0 },
        { tipo: 'P1', quantidade: 0 },
        { tipo: 'P2', quantidade: 0 }
      ];
      localStorage.setItem('estoqueRacao', JSON.stringify(defaultStock));
    }
  
    if (!localStorage.getItem('estoqueOvos')) {
      localStorage.setItem('estoqueOvos', '0');
    }
  };

  // Dynamic ração quantity inputs for estoque
  const racaoEstoqueCheckboxes = document.querySelectorAll('input[name="racao-estoque"]');
  const quantidadeRacaoEstoqueContainer = document.getElementById('quantidade-racao-estoque-container');

  racaoEstoqueCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateRacaoEstoqueQuantityInputs();
    });
  });

  function updateRacaoEstoqueQuantityInputs() {
    quantidadeRacaoEstoqueContainer.innerHTML = '';
    racaoEstoqueCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        const racaoQuantidadeDiv = document.createElement('div');
        racaoQuantidadeDiv.classList.add('racao-quantidade');
        racaoQuantidadeDiv.innerHTML = `
          <label>${checkbox.value}:</label>
          <input type="number" name="quantidade-${checkbox.value}" step="0.1" min="0" placeholder="kg">
        `;
        quantidadeRacaoEstoqueContainer.appendChild(racaoQuantidadeDiv);
      }
    });
  }

  // Render Estoque Ração
  function renderEstoqueRacao() {
    const estoqueRacao = JSON.parse(localStorage.getItem('estoqueRacao'));
    estoqueRacaoTbody.innerHTML = '';
  
    estoqueRacao.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.tipo}</td>
        <td>${item.quantidade.toFixed(1)} kg</td>
      `;
      estoqueRacaoTbody.appendChild(tr);
    });
  }

  // Render Estoque Ovos
  function renderEstoqueOvos() {
    const estoqueOvos = localStorage.getItem('estoqueOvos');
    estoqueOvosTotal.innerHTML = `
      <p><strong>Total de Ovos:</strong> ${estoqueOvos}</p>
    `;
  }

  // Add Estoque Ração
  adicionarEstoqueRacaoForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    let estoqueRacao = JSON.parse(localStorage.getItem('estoqueRacao'));
  
    document.querySelectorAll('.racao-quantidade input').forEach(input => {
      if (input.value) {
        const tipo = input.name.split('-')[1];
        const quantidade = parseFloat(input.value);
      
        const racaoIndex = estoqueRacao.findIndex(r => r.tipo === tipo);
        if (racaoIndex !== -1) {
          estoqueRacao[racaoIndex].quantidade += quantidade;
        }
      }
    });
  
    localStorage.setItem('estoqueRacao', JSON.stringify(estoqueRacao));
    renderEstoqueRacao();
  
    // Reset form
    adicionarEstoqueRacaoForm.reset();
    quantidadeRacaoEstoqueContainer.innerHTML = '';
  });

  // Add Estoque Ovos
  adicionarEstoqueOvosForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const quantidadeOvos = parseInt(document.getElementById('quantidade-ovos-estoque').value);
    const estoqueOvosAtual = parseInt(localStorage.getItem('estoqueOvos') || '0');
  
    localStorage.setItem('estoqueOvos', (estoqueOvosAtual + quantidadeOvos).toString());
    renderEstoqueOvos();
  
    // Reset form
    adicionarEstoqueOvosForm.reset();
  });

  // Initialize stock when page loads
  initStock();
  renderEstoqueRacao();
  renderEstoqueOvos();

  const updateDashboard = () => {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Total Ovos Colhidos Hoje
    const registros = JSON.parse(localStorage.getItem('registros') || '[]');
    const ovosColhidosHoje = registros
      .filter(r => r.data === hoje)
      .reduce((total, registro) => total + parseInt(registro.ovosColhidos), 0);
    
    document.getElementById('dashboard-ovos-colhidos').textContent = ovosColhidosHoje;
    
    // Saldo de Ovos em Estoque
    const estoqueOvos = parseInt(localStorage.getItem('estoqueOvos') || '0');
    document.getElementById('dashboard-estoque-ovos').textContent = estoqueOvos;
    
    // Total Galinhas Mortas Hoje
    const galinhasMortasHoje = registros
      .filter(r => r.data === hoje)
      .reduce((total, registro) => total + parseInt(registro.galinhasMortas), 0);
    
    document.getElementById('dashboard-galinhas-mortas').textContent = galinhasMortasHoje;
    
    // Ração Consumida e em Estoque
    const estoqueRacao = JSON.parse(localStorage.getItem('estoqueRacao') || '[]');
    const racaoTipos = ['Crescimento', 'Pico', 'P1', 'P2'];
    
    racaoTipos.forEach(tipo => {
      const racaoUsadaHoje = registros
        .filter(r => r.data === hoje)
        .reduce((total, registro) => {
          const racaoRegistro = registro.racao.find(r => r.tipo === tipo);
          return total + (racaoRegistro ? parseFloat(racaoRegistro.quantidade) : 0);
        }, 0);
      
      const estoqueRacaoTipo = estoqueRacao.find(r => r.tipo === tipo)?.quantidade || 0;
      
      const usoElement = document.getElementById(`dashboard-racao-${tipo.toLowerCase()}-uso`);
      const estoqueElement = document.getElementById(`dashboard-racao-${tipo.toLowerCase()}-estoque`);
      const progressElement = document.getElementById(`dashboard-racao-${tipo.toLowerCase()}-progress`);
      
      if (usoElement) usoElement.textContent = `${racaoUsadaHoje.toFixed(1)} kg usados`;
      if (estoqueElement) estoqueElement.textContent = `${estoqueRacaoTipo.toFixed(1)} kg em estoque`;
      
      // Progress bar calculation
      if (progressElement && estoqueRacaoTipo > 0) {
        const progressPercentage = Math.min((racaoUsadaHoje / estoqueRacaoTipo) * 100, 100);
        progressElement.style.width = `${progressPercentage}%`;
      }
    });
  };

  // Call updateDashboard on page load and after each data modification
  updateDashboard();

  // Modify existing event listeners to call updateDashboard
  const dashboardUpdateTriggers = [
    'registro-form', 
    'adicionar-estoque-racao-form', 
    'adicionar-estoque-ovos-form'
  ];

  dashboardUpdateTriggers.forEach(formId => {
    const form = document.getElementById(formId);
    if (form) {
      form.addEventListener('submit', updateDashboard);
    }
  });
});