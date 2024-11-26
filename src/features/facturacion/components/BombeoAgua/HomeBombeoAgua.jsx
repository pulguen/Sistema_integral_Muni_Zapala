// src/features/facturacion/components/BombeoAgua/HomeBombeoAgua.jsx
import React, { useContext, useState, useMemo } from 'react';
import {
  Card,
  Table,
  Spinner,
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext';
import BarChart from '../../../../components/common/charts/BarChart';
import LineChart from '../../../../components/common/charts/LineChart';
import StackedBarChart from '../../../../components/common/charts/StackedBarChart';
import RevenuePieChart from '../../../../components/common/charts/RevenuePieChart';
import HistogramChart from '../../../../components/common/charts/HistogramChart';
import HeatmapChart from '../../../../components/common/charts/HeatmapChart';
import KpiCards from '../../../../components/common/charts/KpiCards';

const HomeBombeoAgua = () => {
  const {
    homePeriodos,
    loadingHomePeriodos,
    getPeriodosByServicio,
    getPeriodosByMonth,
    getTrendPeriodos,
    getRevenueByService,
    getIncomeDistribution,
    getHeatmapData,
    getKpis,
    servicios,
    loadingServicios,
  } = useContext(BombeoAguaContext);
  const [displayLimit, setDisplayLimit] = useState(6);

  // Memorizar datos de los gráficos para optimizar rendimiento
  const chartDataServicio = useMemo(() => getPeriodosByServicio(), [getPeriodosByServicio]);
  const chartDataMes = useMemo(() => getPeriodosByMonth(), [getPeriodosByMonth]);
  const chartDataTrend = useMemo(() => getTrendPeriodos(), [getTrendPeriodos]);
  const chartDataRevenue = useMemo(() => getRevenueByService(), [getRevenueByService]);
  const chartDataHistogram = useMemo(() => getIncomeDistribution(), [getIncomeDistribution]);
  const chartDataHeatmap = useMemo(() => getHeatmapData(), [getHeatmapData]);
  const kpiData = useMemo(() => getKpis(), [getKpis]);

  const getServiceNameById = (serviceId) => {
    const service = servicios.find(
      (servicio) => servicio.id === serviceId
    );
    return service ? service.nombre : 'Servicio desconocido';
  };

  const toggleDisplayLimit = () => {
    setDisplayLimit(
      displayLimit === 6 ? homePeriodos.length : 6
    );
  };

  return (
    <div className="home-bombeo-agua">
      <Card className="p-3 shadow-sm">
        {(loadingHomePeriodos || loadingServicios) ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {/* KPIs */}
            {homePeriodos.length > 0 && (
              <KpiCards
                totalPeriodos={kpiData.totalPeriodos}
                totalIngresos={kpiData.totalIngresos}
                promedioMensual={kpiData.promedioMensual}
              />
            )}

            {/* Gráficos */}
            {homePeriodos.length > 0 && (
              <>
                {/* Primera Fila de Gráficos */}
                <Row className="mb-4">
                  <Col md={4}>
                    <h5 className="text-center mb-3">Comparativa de Periodos Generados</h5>
                    <RevenuePieChart data={chartDataServicio} loading={loadingHomePeriodos || loadingServicios} />
                  </Col>
                  <Col md={4}>
                    <h5 className="text-center mb-3">Periodos Generados por Mes</h5>
                    <BarChart data={chartDataMes} loading={loadingHomePeriodos || loadingServicios} />
                  </Col>
                  <Col md={4}>
                    <h5 className="text-center mb-3">Tendencia de Periodos Generados</h5>
                    <LineChart data={chartDataTrend} loading={loadingHomePeriodos || loadingServicios} />
                  </Col>
                </Row>

                {/* Segunda Fila de Gráficos */}
                <Row className="mb-4">
                  <Col md={6}>
                    <h5 className="text-center mb-3">Periodos Generados por Mes y Servicio</h5>
                    <StackedBarChart data={chartDataMes} loading={loadingHomePeriodos || loadingServicios} />
                  </Col>
                  <Col md={6}>
                    <h5 className="text-center mb-3">Distribución de Ingresos por Servicio</h5>
                    <RevenuePieChart data={chartDataRevenue} loading={loadingHomePeriodos || loadingServicios} />
                  </Col>
                </Row>

                {/* Tercera Fila de Gráficos */}
                <Row className="mb-4">
                  <Col md={6}>
                    <h5 className="text-center mb-3">Distribución de Ingresos</h5>
                    <HistogramChart data={chartDataHistogram} loading={loadingHomePeriodos || loadingServicios} />
                  </Col>
                  <Col md={6}>
                    <h5 className="text-center mb-3">Mapa de Calor de Periodos Generados</h5>
                    <HeatmapChart data={chartDataHeatmap} loading={loadingHomePeriodos || loadingServicios} />
                  </Col>
                </Row>
              </>
            )}

            {/* Tabla */}
            <h2 className="text-center mb-4">Últimos Periodos Generados</h2>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>DNI</th>
                  <th>Servicio</th>
                  <th>Mes</th>
                  <th>Año</th>
                  <th>Cuota</th>
                  <th>Importe AR$</th>
                  <th>Vencimiento</th>
                  <th>Fecha creación</th>
                </tr>
              </thead>
              <tbody>
                {homePeriodos.length > 0 ? (
                  homePeriodos.slice(0, displayLimit).map((periodo, index) => (
                    <tr key={periodo.id}>
                      <td>{index + 1}</td>
                      <td>
                        {periodo.cliente && periodo.cliente.persona
                          ? `${periodo.cliente.persona.nombre} ${periodo.cliente.persona.apellido}`
                          : 'Cliente desconocido'}
                      </td>
                      <td>{periodo.cliente?.persona?.dni ?? 'N/A'}</td>
                      <td>{getServiceNameById(periodo.servicio_id)}</td>
                      <td>{periodo.mes}</td>
                      <td>{periodo.año}</td>
                      <td>{periodo.cuota}</td>
                      <td>{`${parseFloat(periodo.i_debito).toFixed(2)}`}</td>
                      <td>
                        {periodo.f_vencimiento
                          ? new Date(periodo.f_vencimiento).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        {periodo.created_at
                          ? new Date(periodo.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center text-muted">
                      No hay periodos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {homePeriodos.length > 6 && (
              <div className="text-center mt-3">
                <Button
                  variant="outline-primary"
                  onClick={toggleDisplayLimit}
                >
                  {displayLimit === 6 ? 'Mostrar más' : 'Mostrar menos'}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default HomeBombeoAgua;
