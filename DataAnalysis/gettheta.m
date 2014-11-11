coords = [];
classes = [];

figure;
hold on;
c='b';
for i=1:N
    if ~strcmp(names{i}, 'last_features')
        t = d.(names{i});
        coords = [coords ; t.dbfeatures];
        classes = [classes; t.dbmembership];
        
        if t.dbmembership>0
            plot3(t.dbfeatures(3), t.dbfeatures(2), t.dbfeatures(1), [c '+']);
        else
            plot3(t.dbfeatures(3), t.dbfeatures(2), t.dbfeatures(1), [c '*']);
        end;
    end;
end;

n=3;
initial_theta = ones(n, 1);%zeros(n, 1);
options = optimset('GradObj', 'on', 'maxIter', 1000);

[theta] = fmincg (@(t)(logregCostFunction(t, coords, classes)), initial_theta, options);

col=0; fun=1;
dist = (-theta(2)*col - theta(3)*fun)/theta(1);

[col, fun] = meshgrid(0:0.02:1, 0:0.2:1);
surf(col, fun, (-theta(2)*col - theta(3)*fun)/theta(1), 'EdgeColor', 'r');
xlabel('color');
ylabel('function');
zlabel('distance');