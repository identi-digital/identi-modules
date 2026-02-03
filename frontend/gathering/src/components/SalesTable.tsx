import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Paper from '@mui/material/Paper';
// import Translation from '~/ui/components/shared/translation';
import { fCurrency } from '@ui/utils/formatNumber';
import DateCell from '@ui/components/atoms/DateCell/DateCell';

type SimpleHeader = {
  head: string;
  align?: 'left' | 'center' | 'right' | 'justify' | undefined;
  width?: string;
  value: string;
  parse?: 'quantity' | 'price' | 'date';
  render?: (row: any) => React.ReactNode;
};

type SalesTableProps = {
  rows: any[];
  headers: SimpleHeader[];
};

const SalesTable: React.FC<SalesTableProps> = ({ rows, headers }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {headers.map((header: SimpleHeader, index: number) => {
              return (
                <TableCell
                  key={index}
                  align={header.align}
                  width={header.width}
                >
                  {header.head}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length}>
                <Typography sx={{ fontSize: '14px' }}>
                  No se encontraron resultados.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            <>
              {rows.map((row: any, index: number) => (
                <TableRow
                  key={`${row.id}_${index}`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {headers.map((head: any, index: number) => {
                    return (
                      <TableCell
                        key={index}
                        align={head.align}
                        sx={{ paddingLeft: '8px' }}
                      >
                        <>
                          {head.parse ? (
                            <>
                              {head.parse === 'quantity' && (
                                <>{row[head['value']]} kg</>
                              )}
                              {head.parse === 'price' && (
                                <>
                                  {/* <Translation text={'S/.'} />{' '} */}
                                  S/.{' '}
                                  {fCurrency(
                                    (!isNaN(+row[head['value']])
                                      ? +row[head['value']]
                                      : 0
                                    ).toFixed(2),
                                  )}
                                </>
                              )}
                              {head.parse === 'date' && (
                                <DateCell
                                  date={new Date(row[head['value']])}
                                  showTime={true}
                                  inline
                                />
                              )}
                            </>
                          ) : (
                            <>
                              {head.render
                                ? head.render(row)
                                : row[head['value']]}
                            </>
                          )}
                        </>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SalesTable;
