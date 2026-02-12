"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metrics } from "@/config/sheets";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps {
  data: Metrics[];
}

export function DataTable({ data }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ordenar por data crescente (Janeiro -> Dezembro)
  // useMemo aqui seria bom, mas como 'data' muda com o filtro pai, o sort é rápido o suficiente para <5000 itens
  const sortedData = [...data].sort((a, b) => {
    const parse = (d: string) => {
        const parts = d.split('/');
        return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`).getTime();
    };
    return parse(a.date) - parse(b.date);
  });

  // Paginação
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  return (
    <Card className="col-span-1 md:col-span-4 border-border/50 bg-card mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Base de Dados Detalhada</CardTitle>
        <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-muted-foreground">
            {data.length} registros
            </Badge>
            <div className="flex items-center gap-1">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={handlePrev} 
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                    {currentPage} / {totalPages || 1}
                </span>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/50 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="min-w-[100px]">Data</TableHead>
                
                {/* Financeiro */}
                <TableHead className="text-right min-w-[120px]">Tráfego</TableHead>
                <TableHead className="text-right min-w-[120px]">Depósitos</TableHead>
                <TableHead className="text-right min-w-[80px]">FTDs</TableHead>
                <TableHead className="text-right min-w-[100px]">Conv. Lead%</TableHead> 
                <TableHead className="text-right min-w-[120px]">Rev. Share</TableHead>
                <TableHead className="text-right min-w-[80px]">ROAS</TableHead>
                
                {/* Leads */}
                <TableHead className="text-right min-w-[80px]">Leads</TableHead>
                <TableHead className="text-right min-w-[80px]">Entrada</TableHead>
                <TableHead className="text-right min-w-[80px]">Saída</TableHead>
                
                {/* Qualidade */}
                <TableHead className="text-center min-w-[80px]">G. Score</TableHead>
                <TableHead className="text-center min-w-[80px]">Live?</TableHead>
                <TableHead className="text-right min-w-[80px]">Pico</TableHead>
                <TableHead className="text-center min-w-[80px]">Score Live</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center h-24 text-muted-foreground">
                    Nenhum dado encontrado para o período.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-muted/30 whitespace-nowrap">
                    <TableCell className="font-medium">{row.date}</TableCell>
                    
                    {/* Financeiro */}
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {row.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {row.deposits.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-right">{row.sales}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                        {row.leads > 0 ? ((row.sales / row.leads) * 100).toFixed(2) : '0.00'}%
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-500">
                      {row.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className={cn(
                        "text-right font-bold",
                        row.roas >= 1 ? "text-green-500" : "text-red-500"
                    )}>
                      {row.roas.toFixed(2)}x
                    </TableCell>
                    
                    {/* Leads */}
                    <TableCell className="text-right">{row.leads}</TableCell>
                    <TableCell className="text-right text-blue-400">+{row.leads_entrada}</TableCell>
                    <TableCell className="text-right text-red-400">-{row.leads_saida}</TableCell>
                    
                    {/* Qualidade */}
                    <TableCell className="text-center font-bold">{row.grupo_score}</TableCell>
                    <TableCell className="text-center">
                      {row.live_assistida?.toUpperCase() === 'SIM' ? (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-0">SIM</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{row.pico_live > 0 ? row.pico_live : '-'}</TableCell>
                    <TableCell className="text-center font-bold text-yellow-500">
                      {row.score_live_total > 0 ? row.score_live_total : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
