%coords = t.real_coords;
%col = t.real_colors;

coords = allcoords{i};
col = allcols{i};

if length(col) == 0
    col = [0 0 0];
end;

types = ['?', '0', '1'];

hold on;
scatter(coords(:, 1), coords(:, 2), 1, 'k')
p=10;
f = ''; s='*';
if findstr(t.labels{5}, 'shop')
    f='(1)';
else 
    f='(0)';
end;
scatter(coords(1:4, 1), coords(1:4, 2), 40, convertCol(col(1:4)), s, 'LineWidth', 3)
text(coords(1, 1)+p, coords(1, 2), '0')
text(coords(2, 1)+p, coords(2, 2), '0')
text(coords(3, 1)+p, coords(3, 2), '1')
text(coords(4, 1)+p, coords(4, 2), '1')
if isfield(t, 'dbmembership')
    membership = t.dbmembership;
else
    membership = -1;
end;

if membership == 0
    s='o';
else
    s='s';
end;
scatter(coords(5, 1), coords(5, 2), 40, convertCol(col(5)), s, 'LineWidth', 3)

text(coords(5, 1)+p, coords(5, 2), [types(membership+2) ' ' f])
title(['membership: ' num2str(membership)]);