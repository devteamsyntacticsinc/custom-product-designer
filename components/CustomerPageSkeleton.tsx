import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CustomerPageSkeleton() {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="py-4 sm:py-6">
                <Skeleton className="h-8 w-48 sm:h-9 sm:w-64" />
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead><Skeleton className="h-4 w-15" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-15" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-15" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-4 w-15 rounded-full ml-auto" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 8 }).map((_, index) => (
                                <TableRow key={`loading-${index}`}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-4" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32 sm:w-40" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-48 sm:w-60" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24 sm:w-32" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Skeleton className="h-5 w-8 rounded-full ml-auto" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
