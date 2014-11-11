names=fieldnames(d);
N=length(names);

s = ceil(sqrt(N));
w = s;
h = s;

types = ['?', '0', '1'];

figure;
for i=1:N
    if ~strcmp(names{i}, 'last_features')
        t = d.(names{i});
        coords = t.real_coords;
        col = t.real_colors;

        subplot(h, w, i);
        hold on;
        scatter(coords(:, 1), coords(:, 2), 1, 'k')
        scatter(coords(:, 1), coords(:, 2), 40, convertCol(col), 'LineWidth', 3)
        p=10;
        f = '';
        if findstr(t.labels{5}, 'shop')
            f='s';
        else 
            f='h';
        end;
        text(coords(1, 1)+p, coords(1, 2), '0')
        text(coords(2, 1)+p, coords(2, 2), '0')
        text(coords(3, 1)+p, coords(3, 2), '1')
        text(coords(4, 1)+p, coords(4, 2), '1')
        text(coords(5, 1)+p, coords(5, 2), [types(t.dbmembership+2) ' ' f])
        title(['membership: ' num2str(t.dbmembership)]);
    end;
end;