<?php

namespace App\Helpers;

use Carbon\Carbon;

class DateHelper
{
    /**
     * Get date range from request with sensible defaults
     * 
     * @param \Illuminate\Http\Request $request
     * @param bool $defaultToCurrentMonth
     * @return array
     */
    public static function getDateRangeFromRequest($request, $defaultToCurrentMonth = true)
    {
        if ($defaultToCurrentMonth) {
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());
        } else {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
        }

        return [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'start' => Carbon::parse($startDate),
            'end' => Carbon::parse($endDate)
        ];
    }

    /**
     * Get monthly trend data for N months
     * 
     * @param int $months
     * @return array
     */
    public static function getMonthlyRange($months = 6)
    {
        $result = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();

            $result[] = [
                'month' => $monthStart->format('M Y'),
                'start' => $monthStart,
                'end' => $monthEnd
            ];
        }

        return $result;
    }
}
