import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Generate financial insights: rental income, overdue rent, maintenance costs
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all required data
    const [rentPayments, maintenanceTickets, deposits] = await Promise.all([
      base44.asServiceRole.entities.RentPayment.list(),
      base44.asServiceRole.entities.MaintenanceTicket.list(),
      base44.asServiceRole.entities.DepositProtection.list()
    ]);

    // Calculate total rental income
    const totalRentalIncome = rentPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.payment_received || 0), 0);

    // Track overdue rent per property
    const today = new Date();
    const overdueRentByProperty = {};
    
    rentPayments
      .filter(p => p.status === 'overdue' || (p.status === 'pending' && new Date(p.due_date) < today))
      .forEach(payment => {
        const propId = payment.property_id;
        if (!overdueRentByProperty[propId]) {
          overdueRentByProperty[propId] = {
            property_id: propId,
            property_name: payment.property_name,
            total_overdue: 0,
            overdue_payments: []
          };
        }
        overdueRentByProperty[propId].total_overdue += payment.rent_amount;
        overdueRentByProperty[propId].overdue_payments.push({
          tenant: payment.tenant_name,
          amount: payment.rent_amount,
          due_date: payment.due_date,
          days_overdue: Math.floor((today - new Date(payment.due_date)) / (1000 * 3600 * 24))
        });
      });

    // Calculate maintenance expenditure per property per month
    const maintenanceByProperty = {};
    const incomeByProperty = {};

    rentPayments.forEach(payment => {
      const propId = payment.property_id;
      if (!incomeByProperty[propId]) {
        incomeByProperty[propId] = {
          property_id: propId,
          property_name: payment.property_name,
          monthly_rent: payment.rent_amount,
          total_received: 0,
          total_expected: 0,
          payment_history: []
        };
      }
      incomeByProperty[propId].total_expected += payment.rent_amount;
      if (payment.status === 'paid') {
        incomeByProperty[propId].total_received += payment.payment_received || payment.rent_amount;
      }
      incomeByProperty[propId].payment_history.push({
        date: payment.due_date,
        amount: payment.rent_amount,
        received: payment.status === 'paid',
        status: payment.status
      });
    });

    maintenanceTickets
      .filter(t => t.actual_cost)
      .forEach(ticket => {
        const propId = ticket.property_id;
        if (!maintenanceByProperty[propId]) {
          maintenanceByProperty[propId] = {
            property_id: propId,
            property_name: ticket.property_name,
            total_maintenance: 0,
            tickets: []
          };
        }
        maintenanceByProperty[propId].total_maintenance += ticket.actual_cost;
        maintenanceByProperty[propId].tickets.push({
          date: ticket.completed_date || ticket.reported_date,
          cost: ticket.actual_cost,
          category: ticket.category,
          title: ticket.title
        });
      });

    // Calculate ROI per property
    const propertyFinancials = Object.keys(incomeByProperty).map(propId => {
      const income = incomeByProperty[propId];
      const maintenance = maintenanceByProperty[propId] || { total_maintenance: 0 };
      const netProfit = income.total_received - maintenance.total_maintenance;
      const roi = income.total_received > 0 ? (netProfit / income.total_received) * 100 : 0;

      return {
        property_id: propId,
        property_name: income.property_name,
        total_rent_expected: income.total_expected,
        total_rent_received: income.total_received,
        collection_rate: income.total_expected > 0 ? (income.total_received / income.total_expected) * 100 : 0,
        maintenance_costs: maintenance.total_maintenance,
        net_profit: netProfit,
        roi_percentage: Math.round(roi * 100) / 100,
        overdue_amount: overdueRentByProperty[propId]?.total_overdue || 0
      };
    });

    // Monthly trends
    const monthlyTrends = calculateMonthlyTrends(rentPayments, maintenanceTickets);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total_rental_income: Math.round(totalRentalIncome * 100) / 100,
        total_overdue_rent: Object.values(overdueRentByProperty).reduce((sum, p) => sum + p.total_overdue, 0),
        total_maintenance_costs: Object.values(maintenanceByProperty).reduce((sum, p) => sum + p.total_maintenance, 0),
        total_properties: Object.keys(incomeByProperty).length
      },
      property_financials: propertyFinancials,
      overdue_rent_by_property: Object.values(overdueRentByProperty),
      monthly_trends: monthlyTrends
    });
  } catch (error) {
    return Response.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});

/**
 * Calculate monthly income vs maintenance trends
 */
function calculateMonthlyTrends(rentPayments, maintenanceTickets) {
  const trends = {};

  // Add rent income by month
  rentPayments
    .filter(p => p.status === 'paid' && p.payment_date)
    .forEach(payment => {
      const date = new Date(payment.payment_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!trends[monthKey]) {
        trends[monthKey] = {
          month: monthKey,
          rental_income: 0,
          maintenance_costs: 0,
          net_profit: 0
        };
      }
      trends[monthKey].rental_income += payment.payment_received || payment.rent_amount;
    });

  // Add maintenance costs by month
  maintenanceTickets
    .filter(t => t.actual_cost && t.completed_date)
    .forEach(ticket => {
      const date = new Date(ticket.completed_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!trends[monthKey]) {
        trends[monthKey] = {
          month: monthKey,
          rental_income: 0,
          maintenance_costs: 0,
          net_profit: 0
        };
      }
      trends[monthKey].maintenance_costs += ticket.actual_cost;
    });

  // Calculate net profit
  Object.values(trends).forEach(month => {
    month.net_profit = month.rental_income - month.maintenance_costs;
  });

  // Sort by month and return last 12 months
  return Object.values(trends)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);
}